(function () {
    let value = null;
    try {
        value = JSON.parse(JSON.stringify(window.__INITIAL_STATE__));
    }
    catch (e) {
        console.error('window.__INITIAL_STATE__:', e);
    }
    // 触发事件并传递数据
    document.dispatchEvent(new CustomEvent('FromPage', {
        detail: value,
    }));
})();
