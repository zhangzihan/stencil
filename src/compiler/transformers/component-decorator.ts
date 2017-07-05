import { ComponentMeta, ComponentOptions, Diagnostic, ModuleFileMeta } from '../interfaces';
import { normalizeStyles } from './normalize-styles';
import * as ts from 'typescript';


export function getComponentDecoratorData(moduleFile: ModuleFileMeta, diagnostics: Diagnostic[], classNode: ts.ClassDeclaration) {
  let metaData: ComponentMeta = null;

  if (!classNode.decorators) {
    return metaData;
  }

  let isComponent = false;

  classNode.decorators.forEach(decorator => {

    decorator.forEachChild(decoratorChild => {

      decoratorChild.forEachChild(componentChild => {

        if (componentChild.getText().trim() === 'Component') {
          isComponent = true;

        } else if (isComponent) {
          metaData = parseComponentMetaData(moduleFile, diagnostics, componentChild.getText());
        }

      });

    });
  });

  return metaData;
}


function parseComponentMetaData(moduleFile: ModuleFileMeta, diagnostics: Diagnostic[], text: string): ComponentMeta {
  try {
    const fnStr = `return ${text};`;

    // parse user component options
    const userOpts: ComponentOptions = new Function(fnStr)();

    // convert user component options from user into component meta
    const cmpMeta: ComponentMeta = {};

    normalizeTag(moduleFile, diagnostics, userOpts, cmpMeta, text);
    normalizeStyles(userOpts, cmpMeta);
    normalizeShadow(userOpts, cmpMeta);
    normalizeHost(userOpts, cmpMeta);

    return cmpMeta;

  } catch (e) {
    diagnostics.push({
      msg: `${e}: text`,
      type: 'error',
      filePath: moduleFile.filePath
    });
  }
  return null;
}


function normalizeTag(moduleFile: ModuleFileMeta, diagnostics: Diagnostic[], userOpts: ComponentOptions, cmpMeta: ComponentMeta, orgText: string) {

  if ((<any>userOpts).selector) {
    diagnostics.push({
      msg: `Please use "tag" instead of "selector" in component decorator: ${(<any>userOpts).selector}`,
      type: 'error',
      filePath: moduleFile.filePath
    });
    cmpMeta.tagNameMeta = (<any>userOpts).selector;
  }

  cmpMeta.tagNameMeta = userOpts.tag;

  if (!cmpMeta.tagNameMeta || cmpMeta.tagNameMeta.trim() === '') {
    throw `tag missing in component decorator: ${orgText}`;
  }

  cmpMeta.tagNameMeta = cmpMeta.tagNameMeta.trim().toLowerCase();

  if (cmpMeta.tagNameMeta.indexOf(' ') > -1) {
    throw `"${cmpMeta.tagNameMeta}" tag cannot contain a space`;
  }

  if (cmpMeta.tagNameMeta.indexOf(',') > -1) {
    throw `"${cmpMeta.tagNameMeta}" tag cannot be use for multiple tags`;
  }

  let invalidChars = cmpMeta.tagNameMeta.replace(/\w|-/g, '');
  if (invalidChars !== '') {
    throw `"${cmpMeta.tagNameMeta}" tag contains invalid characters: ${invalidChars}`;
  }

  if (cmpMeta.tagNameMeta.indexOf('-') === -1) {
    throw `"${cmpMeta.tagNameMeta}" tag must contain a dash (-) to work as a valid web component`;
  }

  if (cmpMeta.tagNameMeta.indexOf('--') > -1) {
    throw `"${cmpMeta.tagNameMeta}" tag cannot contain multiple dashes (--) next to each other`;
  }

  if (cmpMeta.tagNameMeta.indexOf('-') === 0) {
    throw `"${cmpMeta.tagNameMeta}" tag cannot start with a dash (-)`;
  }

  if (cmpMeta.tagNameMeta.lastIndexOf('-') === cmpMeta.tagNameMeta.length - 1) {
    throw `"${cmpMeta.tagNameMeta}" tag cannot end with a dash (-)`;
  }
}


function normalizeShadow(userOpts: ComponentOptions, cmpMeta: ComponentMeta) {
  const rawShadowValue: any = userOpts.shadow;

  // default to NOT use shadow dom
  cmpMeta.isShadowMeta = false;

  // try to figure out a best guess depending on the value they put in
  if (rawShadowValue !== undefined) {
    if (typeof rawShadowValue === 'string') {
      if (rawShadowValue.toLowerCase().trim() === 'true') {
        cmpMeta.isShadowMeta = true;
      }

    } else {
      // ensure it's a boolean
      cmpMeta.isShadowMeta = !!rawShadowValue;
    }
  }
}


function normalizeHost(userOpts: ComponentOptions, cmpMeta: ComponentMeta) {
  cmpMeta.hostMeta = userOpts.host || {};
}
