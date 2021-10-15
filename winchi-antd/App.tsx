import React, { createContext, useContext, useState, useRef } from 'react';
import 'antd/dist/antd.css';
import Wc, { R } from 'winchi';
import type { WcConfig } from './d';

let defaultAlias = {
  small: '紧凑',
  middle: '中等',
  large: '宽松',
  handle: '操作',
  edit: '编辑',
  remove: '删除',
  nextStep: '下一步',
  lastStep: '上一步',
  submit: '提交',
  add: '新增',
  reset: '重置',
  search: '查询',
  tableErr: '请求失败',
  loading: '加载中..',
};

let defaultConfig: WcConfig = {
  alias: defaultAlias,
  uploadConfig: Wc.obj,
};

const _effectDefaultAlias = R.curry((old: WcConfig, cur) => {
  defaultAlias = { ...old.alias, ...(cur.alias || Wc.obj) };
  return cur;
});

const _effectDefaultConfig = (newConfig) => {
  defaultConfig = newConfig;
};

const _setWcConfigHandle: AF = (oldConfig, handle: AF) =>
  R.compose(handle, Wc.mergeDeepRight(oldConfig), _effectDefaultAlias(oldConfig));

export interface WcContextValue {
  wcConfig: WcConfig;
  wcConfigRef: React.RefObject<WcConfig>;
  setWcConfig: (c?: Partial<WcConfig>) => any;
}

export const WcContext = createContext<WcContextValue>({
  wcConfig: defaultConfig,
  wcConfigRef: { current: defaultConfig },
  setWcConfig: _setWcConfigHandle(defaultConfig, _effectDefaultConfig),
});

export const WcProvider: React.FC<{ InitialConfig?: Partial<WcConfig> }> = ({ children }) => {
  const [wcConfig, setWcConfig] = useState<WcConfig>(
    Wc.mergeDeepRight(defaultConfig, defaultConfig),
  );
  const wcConfigRef = useRef<WcConfig>(wcConfig);

  const wcConfigChangeHandle = (v) => {
    setWcConfig(v);
    wcConfigRef.current = v;
  };

  return (
    <WcContext.Provider
      value={{
        wcConfig,
        setWcConfig(newConfig) {
          _setWcConfigHandle(wcConfigRef.current, wcConfigChangeHandle)(newConfig);
        },
        wcConfigRef,
      }}
    >
      {children}
    </WcContext.Provider>
  );
};

/**
 * @description HOC Component
 */
export const UseWcConfigRender: React.FC<{
  children: (value: WcContextValue) => React.ReactNode;
}> = ({ children }) => {
  const wcConfig = useContext(WcContext);
  return <>{children?.(wcConfig)}</>;
};
