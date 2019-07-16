// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://app.asana.com*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var WEBSOCKET_URL = "wss://127.0.0.1:2794";

    var socket = new WebSocket(WEBSOCKET_URL);
    socket.onopen = main;

    function main() {
        var activeTaskIndex = 0;
        var activeTaskEl = null;

        syncActiveTaskEl();
        restyleTaskList();

        socket.onmessage = function(event) {
            var message = JSON.parse(event.data);

            switch(message.type) {
                case "complete-task":
                    var completeTaskEl = getCompleteTaskElementForTaskElement(activeTaskEl);
                    triggerClick(completeTaskEl);
                    break;
                case "nav-up":
                    activeTaskIndex--;
                    break;
                case "nav-down":
                    activeTaskIndex++;
                    break;
            }

            syncActiveTaskEl();
            restyleTaskList();
        }

        function syncActiveTaskEl() {
            activeTaskEl = getTaskElement(activeTaskIndex);
        }

        function restyleTaskList() {
            for (var taskEl of getTaskElements()) {
                taskEl.style = "";
            }

            activeTaskEl.style = 'border: 1px solid red';
        }
    }

    function getTaskElement(index) {
        return getTaskElements()[index];
    }

    function getTaskElements() {
        return document.querySelectorAll(".TaskList > .dropTargetRow");
    }

    function getCompleteTaskElementForTaskElement(taskEl) {
        return taskEl.querySelector(".TaskRowCompletionStatus-checkbox");
    }

    function triggerClick(el) {
        var ev = document.createEvent('MouseEvents');
        ev.initEvent('click', true, true);

        el.dispatchEvent(ev);
    }
})();
