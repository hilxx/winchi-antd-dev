import React, { useState, useEffect } from 'react';
import type { MenuProps, MenuItemProps, SubMenuProps } from 'antd';
import { Spin, Menu, Divider } from 'antd';
import Wc, { R } from 'winchi';
import { useWcConfig } from '../hooks';
import styles from './index.less';

const { SubMenu, Item } = Menu;

export interface WcMenuOption extends MenuItemProps, SubMenuProps {
  title: string;
  key: string | number;
  children?: WcMenuOption[];
}

export interface WcMenuProps extends Omit<MenuProps, 'onSelect'> {
  request?(): Promise<WcMenuOption[]>;
  options?: WcMenuOption[];
  title?: string;
  onSelect?(options: WcMenuOption[]): any;
}

type Model = React.FC<WcMenuProps>;

const WcMenu: Model = ({
  options: options_,
  request,
  title,
  mode = 'inline',
  onSelect = Wc.func,
  ...props
}) => {
  const { wcConfig } = useWcConfig();
  const [options, setOptions] = useState<WcMenuOption[]>();

  useEffect(() => {
    const promise = request || (() => Promise.resolve(options_));
    promise()?.then(Wc.sep(setOptions, (v) => selectHandle(v)({ keyPath: _findFirstKeyPath(v) })));
  }, [options_]);

  const selectHandle: AF = (os) =>
    R.compose(
      onSelect,
      R.reverse as AF,
      _keyPathBackOption(os),
      R.reverse as AF,
      R.prop('keyPath') as AF,
    );

  return (
    <Spin tip={wcConfig.alias.loading} spinning={!options} className={styles.wrap}>
      <>
        <Divider className={styles.divider} />
        <h2 className={`ant-table-cell ${styles.title}`}>{title}</h2>
        {options && (
          <Menu
            onSelect={selectHandle(options)}
            mode={mode}
            defaultSelectedKeys={_findFirstKeyPath(options)[0]}
            defaultOpenKeys={[options[0].key.toString()]}
            {...props}
          >
            {options?.map(resolveWcMenuOption)}
          </Menu>
        )}

        <Divider className={styles.divider} />
      </>
    </Spin>
  );
};

export default React.memo<Model>(WcMenu);

export const resolveWcMenuOption = ({ children, ...props }: WcMenuOption) =>
  children ? (
    <SubMenu {...props}>{children.map((c) => resolveWcMenuOption(c))}</SubMenu>
  ) : (
    <Item {...props}>{props.title}</Item>
  );

const _findFirstKeyPath = (options: WcMenuOption[]): any[] =>
  options[0]?.children
    ? [..._findFirstKeyPath(options[0].children), options[0].key.toString()]
    : [options[0]?.key.toString()];

const _keyPathBackOption = R.curry((options: WcMenuOption[], keys: string[]) => {
  const cur = options.find((o) => `${o.key}` === keys[0]);
  return keys.length > 1 ? [cur, ..._keyPathBackOption(cur?.children, keys.slice(1))] : [cur];
});
