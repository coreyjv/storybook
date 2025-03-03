// Should be added first :
//   Custom Elements polyfill. Required for browsers that do not natively support Custom Elements.
import '@webcomponents/custom-elements';
//   Custom Elements ES5 shim. Required when using ES5 bundles on browsers that natively support
//   Custom Elements (either because the browser does not support ES2015 modules or because the app
//   is explicitly configured to generate ES5 only bundles).
import '@webcomponents/custom-elements/src/native-shim';

import { Injector, NgModule, Type } from '@angular/core';
import { createCustomElement, NgElementConstructor } from '@angular/elements';

import { BehaviorSubject } from 'rxjs';
import { ICollection, StoryFnAngularReturnType } from '../types';
import { Parameters } from '../types-6-0';
import { getStorybookModuleMetadata } from './StorybookModule';
import { RendererService } from './RendererService';

/**
 * Bootstrap angular application to generate a web component with angular element
 */
export class ElementRendererService {
  private rendererService = RendererService.getInstance();

  /**
   * Returns a custom element generated by Angular elements
   */
  public async renderAngularElement({
    storyFnAngular,
    parameters,
  }: {
    storyFnAngular: StoryFnAngularReturnType;
    parameters: Parameters;
  }): Promise<CustomElementConstructor> {
    const ngModule = getStorybookModuleMetadata(
      { storyFnAngular, parameters },
      new BehaviorSubject<ICollection>(storyFnAngular.props)
    );

    return this.rendererService
      .newPlatformBrowserDynamic()
      .bootstrapModule(
        createElementsModule(ngModule),
        parameters.bootstrapModuleOptions ?? undefined
      )
      .then((m) => m.instance.ngEl);
  }
}

const createElementsModule = (ngModule: NgModule): Type<{ ngEl: CustomElementConstructor }> => {
  @NgModule({ ...ngModule })
  class ElementsModule {
    public ngEl: NgElementConstructor<unknown>;

    constructor(private injector: Injector) {
      this.ngEl = createCustomElement(ngModule.bootstrap[0] as Type<unknown>, {
        injector: this.injector,
      });
    }

    ngDoBootstrap() {}
  }
  return ElementsModule;
};
