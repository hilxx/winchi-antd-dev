import { render } from 'react-dom'
import { hot } from 'react-hot-loader/root'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/lib/locale/zh_CN'
import { WcProvider } from './App'
import Page from './Page/Test'

const RenderApp = hot(
 () => <ConfigProvider locale={zhCN} >
  <WcProvider>
   <Page />
  </WcProvider>
 </ConfigProvider>
)

export default render(<RenderApp />, document.getElementById('app'))

// import React, {Component} from 'react';
// import {render} from 'react-dom';
// import {SortableContainer, SortableElement} from 'react-sortable-hoc';
// import Wc, { R } from 'winchi'

// const SortableItem = SortableElement(({value}) => <li>{value}</li>);

// const SortableList = SortableContainer(({items}) => {
//   return (
//     <ul>
//       {items.map((value, index) => (
//         <SortableItem key={`item-${value}`} index={index} value={value} />
//       ))}
//     </ul>
//   );
// });

// class SortableComponent extends Component {
//   state = {
//     items: [<div>item1</div>, 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6'],
//   };
//   onSortEnd = ({oldIndex, newIndex}) => {
//   console.log(oldIndex, newIndex)
//   };
//   render() {
//     return <SortableList items={this.state.items} onSortEnd={this.onSortEnd} />;
//   }
// }

// render(<SortableComponent />, document.getElementById('app'));
