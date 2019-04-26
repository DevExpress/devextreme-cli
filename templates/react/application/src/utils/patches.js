export function menuPreInitPatch(component) {
    const menuOpened = component.state.menuOpened;
    component.state.preInitCssFix = true;
    return {
        get cssClass() {
            if (menuOpened) {
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
