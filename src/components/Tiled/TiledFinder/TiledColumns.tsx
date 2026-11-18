// //import { sampleTiledSearchData } from './sampleData';
// import './Tiled.css'
// import {TiledSearchResult, Breadcrumb } from './types';
// import { TiledColumn } from './TiledColumn';

// type TiledColumnsProps = {
//     columns:TiledSearchResult[];
//     onItemClick: Function;
//     breadcrumbs: Breadcrumb[];
//     handleSelectClick?: Function;
// }
// export default function TiledColumns({
//     columns,
//     onItemClick=()=>{},
//     breadcrumbs,
//     handleSelectClick,
//     ...props
// }: TiledColumnsProps) {

//     return (
//         <div className="flex h-full" {...props}>
//             {columns.map((column, index) =>
//                 <TiledColumn
//                     handleSelectClick={handleSelectClick}
//                     data={column.data}
//                     links={column.links}
//                     meta={column.meta}
//                     key={index}
//                     index={index}
//                     onItemClick={onItemClick}
//                     breadcrumbs={breadcrumbs}
//                 />
//             )}
//         </div>
//     )
// }
