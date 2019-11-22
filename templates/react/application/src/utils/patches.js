export function menuPreInitPatch(component) {
    const { menuOpened, minMenuSize } = component.state;
    component.state.preInitCssFix = true;
    return {
        get cssClass() {
            if (menuOpened || minMenuSize === 0) {
                return "";
            }

            return (component.state.preInitCssFix ? " pre-init-blink-fix" : "");
        },

        onReady() {
            if (menuOpened) {
                return;
            }

            setTimeout(() => {
                component.setState({ preInitCssFix: false });
            });
        }
    };
}
