import { computed, nextTick, onBeforeUnmount, onMounted, watch } from 'vue';

export function useAutoGrow(props, { inputRef, style, displayValue }) {
    const isAutoGrow = computed(() => props.content.type === 'textarea' && !!props.content.autoGrow);

    let resizeObserver = null;
    let styleObserver = null;
    let lastWidth = 0;
    let appliedHeight = '';

    function getMaxHeight(el, borderDelta) {
        const maxRows = Number(props.content.maxRows) || 0;
        if (maxRows <= 0) return 0;

        const computedStyle = wwLib.getFrontWindow().getComputedStyle(el);

        // `line-height: normal` doesn't resolve to a pixel value
        const lineHeight = parseFloat(computedStyle.lineHeight) || parseFloat(computedStyle.fontSize) * 1.2 || 0;
        const padding = (parseFloat(computedStyle.paddingTop) || 0) + (parseFloat(computedStyle.paddingBottom) || 0);

        return maxRows * lineHeight + padding + borderDelta;
    }

    function resizeTextarea() {
        const el = inputRef.value;
        if (!el || !isAutoGrow.value) return;

        // scrollHeight excludes borders under box-sizing: border-box
        const borderDelta = el.offsetHeight - el.clientHeight;

        // Reset first, otherwise the textarea can only ever grow
        el.style.height = 'auto';

        const contentHeight = el.scrollHeight + borderDelta;
        const maxHeight = getMaxHeight(el, borderDelta);
        const isCapped = maxHeight > 0 && contentHeight > maxHeight;

        el.style.height = `${isCapped ? maxHeight : contentHeight}px`;
        el.style.overflowY = isCapped ? 'auto' : 'hidden';
        appliedHeight = el.style.height;
    }

    function clearInlineSize() {
        const el = inputRef.value;
        appliedHeight = '';
        if (!el) return;
        el.style.height = '';
        el.style.overflowY = '';
    }

    function disconnectObservers() {
        resizeObserver?.disconnect();
        styleObserver?.disconnect();
        resizeObserver = null;
        styleObserver = null;
        lastWidth = 0;
    }

    function observeTextarea() {
        disconnectObservers();

        const el = inputRef.value;
        if (!el || !isAutoGrow.value) return;

        const win = wwLib.getFrontWindow();

        // Only width changes matter here: reacting to our own height updates would loop
        if (win?.ResizeObserver) {
            resizeObserver = new win.ResizeObserver(entries => {
                const width = entries[0]?.contentRect?.width ?? 0;
                if (width === lastWidth) return;
                lastWidth = width;
                resizeTextarea();
            });
            resizeObserver.observe(el);
        }

        // WeWeb re-applies the element's inline styles on state changes (hover, selection,
        // edit/preview toggle), which drops the height we set. Put it back when that happens.
        // Comparing against the height we last applied keeps our own writes from looping.
        if (win?.MutationObserver) {
            styleObserver = new win.MutationObserver(() => {
                if (!inputRef.value || inputRef.value.style.height === appliedHeight) return;
                resizeTextarea();
            });
            styleObserver.observe(el, { attributes: true, attributeFilter: ['style'] });
        }
    }

    // Also fires once the textarea is mounted, since inputRef starts null
    watch(
        [isAutoGrow, inputRef],
        () => {
            if (!isAutoGrow.value) {
                disconnectObservers();
                clearInlineSize();
                return;
            }
            observeTextarea();
            nextTick(resizeTextarea);
        },
        { immediate: true }
    );

    // Text styling and row counts change the measured height
    watch([style, () => props.content.rows, () => props.content.maxRows], () => nextTick(resizeTextarea));

    // Values set from outside the component: bindings, form resets, workflow actions
    watch(displayValue, () => nextTick(resizeTextarea));

    onMounted(() => nextTick(resizeTextarea));
    onBeforeUnmount(disconnectObservers);

    return { resizeTextarea };
}
