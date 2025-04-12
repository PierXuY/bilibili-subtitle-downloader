chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "GET_INITIAL_STATE") {
        // 先绑定事件监听器
        const eventListener = (e) => {
            sendResponse(e.detail);
            document.removeEventListener('FromPage', eventListener);
        };
        document.addEventListener('FromPage', eventListener);

        // 注入脚本进行通信
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('inject.js');
        document.head.appendChild(script);
        script.remove();
        // 保持异步通信通道开放
        return true;
    }
});
