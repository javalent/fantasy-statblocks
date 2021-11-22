<div class="tapered-rule" />

<style>
    .tapered-rule {
        width: auto;
        margin: 0.5em 0;
        height: 5px;
        background: -webkit-linear-gradient(
            0deg,
            var(--statblock-rule-color) 0%,
            var(--statblock-rule-color) 50%,
            var(--statblock-background-color) 95%,
            var(--statblock-background-color) 100%
        );
        clip-path: polygon(0 0, 0 100%, 95% 50%);
        -webkit-clip-path: polygon(0 0, 0 100%, 95% 50%);
    }
</style>
