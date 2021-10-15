import React, { useRef, useEffect } from 'react';
import { useMemo } from 'react';
import { defaultRender } from '../../../utils';
import type { WcTableProps, ActionRef } from '../../';
import WcMenu, { WcMenuProps, WcMenuOption } from '../../../Menu';
import styles from './index.less';

export interface WcTableComposeMenuProps extends WcMenuProps {
  children: React.ReactElement;
  requestKey?: string;
}

type Model = React.FC<WcTableComposeMenuProps>;

const WcFilterTableComposeMenu: Model = ({
  children: children_,
  className = '',
  requestKey: requestKey_,
  ...menuProps
}) => {
  const requestKey = requestKey_ ?? '__menuKey';
  const lastSelectMenuRef = useRef<WcMenuOption[]>();
  const actionRef = useRef<ActionRef>();

  const {
    children: originalChildren = defaultRender,
    actionRef: originalActionRef = {},
  } = children_.props as WcTableProps;

  useEffect(() => {
    if (actionRef.current) {
      const reload = actionRef.current.reload;
      const action = {
        ...actionRef.current,
        reload(params) {
          return reload({ [requestKey]: lastSelectMenuRef.current, ...params });
        },
      };
      const refs = [
        ...(Array.isArray(originalActionRef) ? originalActionRef : [originalActionRef]),
        actionRef,
      ];

      refs.forEach((ref) => (ref.current = action));
    }
  });

  const menuSelectHandle = (arr: any[]) => {
    lastSelectMenuRef.current = arr;
    actionRef.current?.reload();
  };

  const children = useMemo(
    () =>
      React.cloneElement(children_, {
        children(node, props) {
          return (
            <main className={`${styles.wrap} ${className}`}>
              <WcMenu {...menuProps} onSelect={menuSelectHandle} />
              {originalChildren(node, {
                ...props,
                actionRef,
                preventFirtstRequest: true,
              })}
            </main>
          );
        },
      }),
    [children_, requestKey],
  );

  return children;
};

export default React.memo<Model>(WcFilterTableComposeMenu);
