import React from 'react';
import TreeView from 'devextreme-react/tree-view';
import './side-navigation-menu.scss';

import * as events from 'devextreme/events';

class SideNavigationMenu extends React.Component {
  render() {
    const {
      className,
      children,
      selectedItemChanged,
      selectedItem,
      onMenuReady,
      ...rest
    } = this.props;
    return (
      <div
        className={`${className} side-navigation-menu`}
        ref={this.getElementRef}
      >
        {children}
        <div className={'menu-container'}>
          <TreeView
            expandEvent={'click'}
            width={'100%'}
            {...rest}
            onInitialized={this.onMenuInitialized}
            onItemClick={selectedItemChanged}
            onContentReady={this.onTreeViewReady}
            onSelectionChanged={this.updateSelection}
            selectByClick
            selectionMode={'single'}
            keyExpr={'path'}
          />
        </div>
      </div>
    );
  }

  componentDidUpdate() {
    this.updateMenu();
  }

  onMenuInitialized = (event) => {
    this.treeView = event.component;
    event.component.option('deferRendering', false);
  }

  updateSelection = (event) => {
    const nodeClass = 'dx-treeview-node';
    const selectedClass = 'dx-state-selected';
    const leafNodeClass = 'dx-treeview-node-is-leaf';
    const element = event.element;

    const rootNodes = element.querySelectorAll(
      `.${nodeClass}:not(.${leafNodeClass})`
    );
    Array.from(rootNodes).forEach(node => {
      node.classList.remove(selectedClass);
    });

    let selectedNode = element.querySelector(`.${nodeClass}.${selectedClass}`);
    while (selectedNode && selectedNode.parentElement) {
      if (selectedNode.classList.contains(nodeClass)) {
        selectedNode.classList.add(selectedClass);
      }

      selectedNode = selectedNode.parentElement;
    }

    this.updateMenu();
  }

  getElementRef = ref => {
    if (this.elementRef) {
      events.off(this.elementRef, 'dxclick');
    }

    this.elementRef = ref;
    events.on(this.elementRef, 'dxclick', e => {
      this.props.openMenu(e);
    });
  };

  updateMenu() {
    if (this.treeView) {
      this.treeView.selectItem(this.props.selectedItem);

      if (this.props.compactMode) {
        this.treeView.collapseAll();
      }
    }
  }

  onTreeViewReady = (...args) => {
    this.props.onMenuReady && this.props.onMenuReady(...args);
    this.updateSelection(...args);
  }
}

export default SideNavigationMenu;
