import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const SNAPSHOTS_DIR = '__image_snapshots__';
const diffConfig = { threshold: 0.01 };

const writeImage = (filePath, content) => {
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, content);
};

const resize = (image, width, height) => {
    if(image.width === width && image.height === height) {
        return image;
    }

    const result = new PNG({ width, height, fill: true });
    PNG.bitblt(image, result, 0, 0, image.width, image.height, 0, 0);
    return result;
};

const composeDiff = (images) => {
    const { width, height } = images[0];
    const result = new PNG({ width: width * images.length, height });

    images.forEach((image, index) => PNG.bitblt(image, result, 0, 0, width, height, width * index, 0));
    return PNG.sync.write(result, { filterType: 4 });
};

export function toMatchImageSnapshot(received, {
    customSnapshotIdentifier,
    customDiffDir,
    customReceivedDir,
    storeReceivedOnFailure = false
}) {
    const { testPath, snapshotState, isNot } = this;

    if(isNot) {
        throw new Error('`.not` cannot be used with `.toMatchImageSnapshot()`.');
    }

    const receivedBuffer = Buffer.from(received);
    const snapshotsDir = join(dirname(testPath), SNAPSHOTS_DIR);
    const snapshotPath = join(snapshotsDir, `${customSnapshotIdentifier}.png`);
    const diffPath = join(customDiffDir || join(snapshotsDir, '__diff_output__'), `${customSnapshotIdentifier}-diff.png`);
    const receivedPath = join(customReceivedDir || join(snapshotsDir, '__received_output__'), `${customSnapshotIdentifier}-received.png`);
    const updateState = snapshotState.snapshotUpdateState;

    if(!existsSync(snapshotPath)) {
        if(updateState === 'none') {
            return {
                pass: false,
                message: () => `New snapshot ${snapshotPath} was not written. The update flag must be explicitly passed to write a new snapshot on CI.`
            };
        }

        writeImage(snapshotPath, receivedBuffer);
        return { pass: true, message: () => '' };
    }

    rmSync(diffPath, { force: true });
    rmSync(receivedPath, { force: true });

    const rawReceivedImage = PNG.sync.read(receivedBuffer);
    const rawSnapshotImage = PNG.sync.read(readFileSync(snapshotPath));
    const isSizeMatched = rawReceivedImage.width === rawSnapshotImage.width && rawReceivedImage.height === rawSnapshotImage.height;
    const width = Math.max(rawReceivedImage.width, rawSnapshotImage.width);
    const height = Math.max(rawReceivedImage.height, rawSnapshotImage.height);
    const receivedImage = resize(rawReceivedImage, width, height);
    const snapshotImage = resize(rawSnapshotImage, width, height);
    const diffImage = new PNG({ width, height });

    const diffPixelCount = pixelmatch(receivedImage.data, snapshotImage.data, diffImage.data, width, height, diffConfig);

    if(isSizeMatched && diffPixelCount === 0) {
        return { pass: true, message: () => '' };
    }

    if(updateState === 'all') {
        writeImage(snapshotPath, receivedBuffer);
        return { pass: true, message: () => '' };
    }

    if(storeReceivedOnFailure) {
        writeImage(receivedPath, receivedBuffer);
    }
    writeImage(diffPath, composeDiff([snapshotImage, diffImage, receivedImage]));

    const failure = isSizeMatched
        ? `Expected image to match the snapshot, but ${diffPixelCount} pixels (${diffPixelCount / (width * height) * 100}%) are different.`
        : `Expected image to be the same size as the snapshot (${rawSnapshotImage.width}x${rawSnapshotImage.height}), but was ${rawReceivedImage.width}x${rawReceivedImage.height}.`;

    return {
        pass: false,
        message: () => `${failure}\nSee diff for details: ${diffPath}`
    };
}
