const config = {
    onwarn: (warning, handler) => {
        if (warning.code.startsWith("a11y-")) {
            return;
        }
        handler(warning);
    }
};
