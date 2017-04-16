import { ComponentMeta, ComponentMode, ComponentModeData, ComponentRegistry, Ionic, IonicGlobal, PlatformApi } from '../util/interfaces';
import { h } from '../client/renderer/h';
import { themeVNodeData } from '../client/host';


export function PlatformServer(ionic: IonicGlobal): PlatformApi {
  const registry: ComponentRegistry = {};
  const injectIonic: Ionic = {
    theme: themeVNodeData
  };


  ionic.loadComponents = function loadComponents(bundleId) {
    var args = arguments;
    for (var i = 1; i < args.length; i++) {
      var cmpModeData: ComponentModeData = args[i];
      var tag = cmpModeData[0];
      var mode = cmpModeData[1];
      var styles = cmpModeData[2];
      var importModuleFn = cmpModeData[3];

      console.log(`Ionic.loadComponents, bundle: ${bundleId}, tag: ${tag}, mode: ${mode}`);

      var cmpMeta = registerComponent(tag, []);

      cmpMeta.modes[mode] = {
        styles: styles,
        isLoaded: true
      };

      var moduleImports = {};
      importModuleFn(moduleImports, h, injectIonic);
      cmpMeta.componentModule = moduleImports[Object.keys(moduleImports)[0]];
    }
  };

  function loadComponent(cmpMeta: ComponentMeta, cmpMode: ComponentMode, cb: Function): void {
    if (cmpMode && cmpMode.isLoaded) {
      cb(cmpMeta, cmpMode);

    } else {
      console.log(`invalid component: ${cmpMeta}`);
    }
  }

  function domRead(cb: Function) {
    cb();
  }

  function domWrite(cb: Function) {
    cb();
  }

  function attachShadow(elm: Element, cmpMode: ComponentMode, cmpModeId: string) {
    const shadowElm = elm.attachShadow({ mode: 'open' });

    cmpMode;
    cmpModeId;

    return shadowElm;
  }

  function registerComponent(tag: string, data: any[]) {
    let cmpMeta: ComponentMeta = registry[tag];
    if (cmpMeta) {
      return cmpMeta;
    }

    const props = data[1] || {};

    cmpMeta = registry[tag] = { modes: {} };
    cmpMeta.tag = tag;
    cmpMeta.props = props;

    const hostCssParts = cmpMeta.tag.split('-');
    hostCssParts.shift();
    cmpMeta.hostCss = hostCssParts.join('-');

    props.color = {};
    props.mode = {};

    return cmpMeta;
  }

  function getComponentMeta(tag: string) {
    return registry[tag];
  }

  function createElement<K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K] {
    return <any>{
      tagName: tagName
    };
  }

  function createElementNS(namespaceURI: string, qualifiedName: string): Element {
    return <any>{
      namespaceURI: namespaceURI,
      qualifiedName: qualifiedName,
    };
  }

  function createTextNode(text: string): Text {
    return <any>{
      text: text,
    };
  }

  function createComment(text: string): Comment {
    return <any>{
      text: text,
    };
  }

  function insertBefore(parentNode: any, newNode: Node, referenceNode: Node | null): void {
    if (!parentNode.childNodes) {
      parentNode.childNodes = [newNode];

    } else {
      const refNodeIndex = parentNode.childNodes.indexOf(referenceNode);
      if (refNodeIndex > 0) {
        parentNode.childNodes.splice(refNodeIndex - 1, 0, newNode);
      } else {
        parentNode.childNodes.unshift(referenceNode);
      }
    }
  }

  function removeChild(parentNode: any, childNode: Node): void {
    if (parentNode.childNodes) {
      const refNodeIndex = parentNode.childNodes.indexOf(childNode);
      if (refNodeIndex > -1) {
        parentNode.childNodes.splice(refNodeIndex, 1);
      }
    }
  }

  function appendChild(parentNode: any, childNode: Node): void {
    if (!parentNode.childNodes) {
      parentNode.childNodes = [childNode];

    } else {
      parentNode.childNodes.push(childNode);
    }
  }

  function parentNode(node: Node): Node | null {
    return node.parentNode;
  }

  function nextSibling(node: Node): Node | null {
    return node.nextSibling;
  }

  function tagName(elm: Element): string {
    return (elm.tagName || '').toLowerCase();
  }

  function setTextContent(node: Node, text: string | null): void {
    node.textContent = text;
  }

  function getTextContent(node: Node): string | null {
    return node.textContent;
  }

  function getAttribute(elm: HTMLElement, attrName: string): string {
    return elm.getAttribute(attrName);
  }

  function isElement(node: Node): node is Element {
    return !!(<any>node).tagName;
  }

  function isText(node: Node): node is Text {
    return node.nodeName === '#text';
  }

  function isComment(node: Node): node is Comment {
    return node.nodeName === '#comment';
  }


  return {
    registerComponent: registerComponent,
    getComponentMeta: getComponentMeta,
    loadComponent: loadComponent,

    isElement: isElement,
    isText: isText,
    isComment: isComment,
    nextTick: process.nextTick,
    domRead: domRead,
    domWrite: domWrite,

    $createElement: createElement,
    $createElementNS: createElementNS,
    $createTextNode: createTextNode,
    $createComment: createComment,
    $insertBefore: insertBefore,
    $removeChild: removeChild,
    $appendChild: appendChild,
    $parentNode: parentNode,
    $nextSibling: nextSibling,
    $tagName: tagName,
    $setTextContent: setTextContent,
    $getTextContent: getTextContent,
    $getAttribute: getAttribute,
    $attachShadow: attachShadow
  }
}


export interface BundleCallbacks {
  [bundleId: string]: Function[];
}