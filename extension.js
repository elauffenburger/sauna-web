// ==UserScript==
// @name         Asana Remote
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Control Asana via sauna
// @author       You
// @match        https://app.asana.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    window.onload = function() {
        var WEBSOCKET_URL = "ws://127.0.0.1:2794";

        var socket = new WebSocket(WEBSOCKET_URL);
        socket.onopen = main;

        modifyUi();

        function main() {
            console.log("Socket to sauna open!");

            var activeTaskElSyncInterval = setInterval(function() {
                if (activeTaskEl) {
                    clearInterval(activeTaskElSyncInterval);
                }

                syncActiveTaskEl();
            }, 250);

            var activeTaskIndex = 0;
            var activeTaskEl = null;

            resync();

            socket.onmessage = function (event) {
                var message = event.data;

                switch (message) {
                    case "ready":
                        console.log("sauna ready!");
                        break;
                    case "complete-task":
                        var completeTaskEl = getCompleteTaskElementForTaskElement(activeTaskEl);
                        triggerClick(completeTaskEl);
                        activeTaskIndex--;
                        break;
                    case "nav-up":
                        activeTaskIndex--;
                        break;
                    case "nav-down":
                        activeTaskIndex++;
                        break;
                    default:
                        console.error("Unknown sauna message type %O", message.t);
                        break;
                }

                resync();
            }

            function syncActiveTaskEl() {
                activeTaskEl = getTaskElement(activeTaskIndex);
            }

            function restyleTaskList() {
                for (var taskEl of getTaskElements()) {
                    taskEl.style = "";
                }

                if (activeTaskEl) {
                    activeTaskEl.style = 'border: 1px solid red';
                }
            }

            function resync() {
                syncActiveTaskEl();
                restyleTaskList();
            }
        }

        function modifyUi() {
            hideEl(document.querySelector(".page-topbar"));
            hideEl(document.querySelector(".PageToolbarStructure"));
            document.querySelector(".PotListPage-gridPane").style.flex = "1 1 100%";
            document.body.style.fontSize = "1.5em";
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

        function hideEl(el) {
            el.style.display = "none";
        }
    }
})();
