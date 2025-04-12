(function () {
    let value = JSON.parse(JSON.stringify(window.__INITIAL_STATE__));
    // 触发事件并传递数据
    document.dispatchEvent(new CustomEvent('FromPage', {
        detail: value,
    }));
})();