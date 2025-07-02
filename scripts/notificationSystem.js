const notificationAnchor = document.querySelector('.notification-anchor');
const templatenotification = document.querySelector('#notification-template');

const currentNotifications = [];
const IS_DEBUGGING = false;
let debugIncrement = 1;

function repositionNotifications() {
    //console.log(currentNotifications.length)
    for (let i = currentNotifications.length -1; i > -1; i--) {
        //console.warn(i)
        const currentElement = currentNotifications[i];
        currentElement.style.top = -templatenotification.clientHeight * (currentNotifications.length -1 - i) + 'px';
        //console.log(- templatenotification.clientHeight * i + 'px')
    }
}

export function removeNotification(notificationElement){
    const targetIndex = currentNotifications.indexOf(notificationElement)

    if (targetIndex > -1) {
        currentNotifications.splice(targetIndex, 1);
        notificationAnchor.removeChild(notificationElement);
        repositionNotifications();
    } else {
        console.warn('Notificaiton: '+ notificationElement.textContent +'is not present in array')
        return
    }

}

// Add the notification system
export function createNotification(text, color= '#f1f1f1', lifespan = 2000) {
    const newNotification = document.createElement('div');

    newNotification.className = 'notification';
    newNotification.textContent = text + (IS_DEBUGGING? debugIncrement.toString() : '');
    newNotification.style.color = color;

    currentNotifications.push(newNotification);
    notificationAnchor.appendChild(newNotification);
    repositionNotifications();

    setTimeout(removeNotification, lifespan, newNotification);

    if(IS_DEBUGGING){
        debugIncrement++;
    }

    return newNotification;
}