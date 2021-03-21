import * as React from "react";
import * as ReactDom from "react-dom";
import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from "@microsoft/sp-application-base";
import { Dialog } from '@microsoft/sp-dialog';

import * as strings from 'SpfxmegamenuApplicationCustomizerStrings';

import MegaMenuComponent from "./components/MegaMenuComponent";
import { IMegaMenuProps } from "./components/IMegaMenuProps";
import { IMenuProvider, MenuSPListProvider, MenuFakeProvider } from "./menuProvider/index";

const LOG_SOURCE: string = 'SpfxmegamenuApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ISpfxmegamenuApplicationCustomizerProperties {
  // This is an example; replace with your own property
  rootWebOnly : boolean;
  isDebug: boolean;
  enableSessionStorageCache: boolean;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class SpfxmegamenuApplicationCustomizer
  extends BaseApplicationCustomizer<ISpfxmegamenuApplicationCustomizerProperties> {

  @override
  public onInit(): Promise<void> {

    let placeholder: PlaceholderContent;
    placeholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top);

    // init the react mega menu component.
    const element: React.ReactElement<IMegaMenuProps> = React.createElement(
      MegaMenuComponent,
      {
        menuProvider: this.getMenuProvider()
      }
    );

    // render the react element in the top placeholder.
    ReactDom.render(element, placeholder.domElement);

    return Promise.resolve();
  }

  protected getMenuProvider(): IMenuProvider {

    if (this.properties.isDebug) {

      return new MenuFakeProvider();
    }

    // get the current web absolute url by default.
    let webUrl: string = this.context.pageContext.web.absoluteUrl;

    if (this.properties.rootWebOnly) {

      // if rootWebOnly property enabled then use
      // the SharePoint root web mega menu list.
      webUrl = this.context.pageContext.site.absoluteUrl;
    }

    return new MenuSPListProvider(webUrl, this.properties.enableSessionStorageCache);
  }
}
