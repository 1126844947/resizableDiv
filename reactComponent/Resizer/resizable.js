/**
  使div可拉伸的插件
 前后div不能有padding,
 需要自定义前后div超出高宽样式
*/

function exist(nodes){ 
    if(typeof nodes !=='undefined' && nodes.length>=1){
     return true;
    }
     
    return false;
};

function getStyle(element) {
    if (element.currentStyle) {
        return element.currentStyle
    }
    return window.getComputedStyle(element, null);
}

function getDirection(options) {
    const {offset, direction, element} = options
    const xPos = window.event.offsetX;  // 检查相对于触发事件的对象，鼠标位置的水平坐标 
    const yPos = window.event.offsetY;  // 检查相对于触发事件的对象，鼠标位置的垂直坐标 

    let dir = '';

    if (direction === 'y' && (yPos<offset || yPos > element.offsetHeight-offset)) {
        dir = 'ns';
    }

    if (direction === 'x' && (xPos<offset || xPos > element.offsetWidth-offset)) {
        dir = "ew";
    }
    return dir
}

function getCursor(options) {
    let str = getDirection(options);
    
    if (str === "") str = "default";
    else str += "-resize";
    return str;
}

// 创建控制条节点，并返回该节点
function createHandleArea(targetElement, options){
    let viewObj = options.element.cloneNode(true);

    if (exist(targetElement.getElementsByClassName('resize_handle_area'))) {

        [viewObj] = targetElement.getElementsByClassName('resize_handle_area');

    } else {

        viewObj.style.position= 'absolute';
        viewObj.style.padding= getStyle(targetElement).padding;
        viewObj.style.cursor = getCursor(options);
        viewObj.style.background = options.handleBackground;
        viewObj.setAttribute('class', `resize_handle_area`);

        targetElement.appendChild(viewObj);
    }

    return viewObj;
}

function resizeObject() {
    this.el   = null;
    this.dir  = "";
    this.grabx = null;
    this.graby = null;
    this.width = null;
    this.height = null;
    this.left = null;
    this.top = null;
}

function getOptions(opt) {
    const handleLength = 8;                 // 控制条高度或宽度
    const options = {
        direction: 'y',                     // 可拉伸的方向 x,y  现只支持y轴方向
        offset: 5,                          // 距垂直边缘的水平距离阈值 5个像素内 鼠标符号由普通图表变为双向延伸箭头 距水平边缘的垂直距离阈值 5个像素内 鼠标符号由普通图表变为双向延伸箭头
        handleLength,
        handleWidth: '100%',                // 控制条宽度
        handleHeight: `${handleLength}px`,  // 控制条高度，若拉伸方向为x轴，则height为100%，width为7
        handleBackground: 'rgba(100, 100, 100, 0.1)',           // 控制条背景色
        handleLeft: '0px',                  // 控制条left
        handleTop: '0px',                   // 控制条top
        callback: null,                     // 拉伸完成后回调函数
        ...opt,
    }
  
    if (options.direction === 'x') {
        options.handleWidth = `${handleLength}px`;
    }
  
    return options;
}

function resizableDiv(opt){

    const el = opt.element;
    if (!el) {
        console.error(`can not find dom`);
        return;
    }

    let theobject = null;
    const options = getOptions(opt);

    if (!options.direction) return;

    const {parentNode, previousElementSibling, nextElementSibling, childNodes:[childNode]} = el;
    if (!previousElementSibling || !nextElementSibling) {
        return;
    }

    if (options.direction === 'x') {
        const {paddingTop, paddingBottom} = getStyle(parentNode);
        el.style.height = `${parentNode.offsetHeight - parseFloat(paddingTop) - parseFloat(paddingBottom)}px`;
        el.style.width = `${options.handleLength}px`;
        el.style.display = 'inline-block';
        el.style.verticalAlign = 'middle';
    } else {
        el.style.width = '100%';
        el.style.height = `${options.handleLength}px`;
        el.style.display = 'block';
    }

    function doDown() {

        if (el == null || getStyle(previousElementSibling).display === 'none' || getStyle(nextElementSibling).display === 'none') {
            theobject = null;
            return;
        }
        const dir = getDirection(options);

        parentNode.style.position = 'relative';
        previousElementSibling.style.position = 'relative';
        nextElementSibling.style.position = 'relative';

        theobject = new resizeObject();

        theobject.el = el;
        theobject.dir = dir;
        
        theobject.parentNode = parentNode;
        theobject.nextSibling = nextElementSibling;
        theobject.previousSibling = previousElementSibling;

        theobject.grabx = window.event.clientX;             // 返回鼠标在窗口客户区域中的X坐标。
        theobject.graby = window.event.clientY;             // 返回鼠标在窗口客户区域中的Y坐标
        theobject.width = el.offsetWidth;                   // 元素的宽度
        theobject.height = el.offsetHeight;
        theobject.left = el.offsetLeft;
        theobject.top = el.offsetTop;                       // 元素相对于父元素的top

        const viewObj = createHandleArea(parentNode, options);
        viewObj.style.left = `${dir === 'ew' && theobject.left || 0}px`
        viewObj.style.top = `${dir === 'ns' && theobject.top || 0}px`
        theobject.viewObj = viewObj;

        window.event.returnValue = false;                   // 设置或检查从事件中返回的值  true 事件中的值被返回 false 源对象上事件的默认操作被取消 
        window.event.cancelBubble = true;                   // 检测是否接受上层元素的事件的控制。 TRUE 不被上层原素的事件控制。 FALSE 允许被上层元素的事件控制。这是默认值。
    }

    function doUp() {
        if(!theobject) return;

        if(theobject.dir === 'ns') {

            const distance = theobject.el.offsetTop - theobject.viewObj.offsetTop;
            theobject.previousSibling.style.height = `${theobject.previousSibling.offsetHeight - distance}px`;
            theobject.nextSibling.style.height = `${theobject.nextSibling.offsetHeight + distance}px`;
            theobject.parentNode.removeChild(theobject.viewObj);

        } else {
            
            const distance = theobject.el.offsetLeft - theobject.viewObj.offsetLeft;
            theobject.previousSibling.style.width = `${theobject.previousSibling.offsetWidth - distance}px`;
            theobject.nextSibling.style.width = `${theobject.nextSibling.offsetWidth + distance}px`;
            theobject.parentNode.removeChild(theobject.viewObj);
        }

        if (theobject != null) {
            theobject = null;
        }

        if (options.callback) options.callback();
    }

    function doMove() {

        el.style.cursor = getCursor(options);
        if (theobject == null) {
            return;
        }

        // 通过定义cursor 使div上出现可调节大小的双向箭头
        theobject.viewObj.style.cursor = getCursor(options);

        if(theobject.dir === 'ns') {
            
            let top = Math.min(theobject.top + window.event.clientY - theobject.graby, theobject.top + theobject.nextSibling.offsetHeight);
            if (top < theobject.previousSibling.offsetTop) top = theobject.previousSibling.offsetTop;
            theobject.viewObj.style.top = `${top}px`;

        } else {

            let left = Math.min(theobject.left + window.event.clientX - theobject.grabx, theobject.left + theobject.nextSibling.offsetWidth);
            if (left < theobject.previousSibling.offsetLeft) left = theobject.previousSibling.offsetLeft;
            theobject.viewObj.style.left = `${left}px`;

            
        }
        window.event.returnValue = false;
        window.event.cancelBubble = true;
    }

    parentNode.onmousedown = doDown;
    document.onmouseup   = doUp;
    document.onmousemove = doMove;

}

export default resizableDiv;
