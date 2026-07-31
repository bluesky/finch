import{j as e}from"./jsx-runtime-Cf8x2fCZ.js";import{useMDXComponents as r}from"./index-DI2gBlDf.js";import{W as t}from"./index-D0tn-N0q.js";import"./index-yBjzXJbu.js";import"./index-BlmOqGMO.js";import"./iframe-U_WlO_lp.js";import"../sb-preview/runtime.js";import"./index-czWnIymw.js";import"./index-fNjTmf9T.js";import"./index-cS34vJOP.js";import"./index-DrFu-skq.js";function s(n){const a={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",hr:"hr",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...r(),...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(t,{title:"Documentation/Tiled API Hooks"}),`
`,e.jsx(a.h1,{id:"tiled-api-hooks",children:"Tiled API Hooks"}),`
`,e.jsxs(a.p,{children:["Finch integrates with the ",e.jsx(a.a,{href:"https://blueskyproject.io/tiled",rel:"nofollow",children:"Tiled"})," data access service via two surfaces:"]}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:[e.jsxs(a.strong,{children:[e.jsx(a.code,{children:"Tiled.*"})," namespace"]})," — async functions exported from ",e.jsx(a.code,{children:"@blueskyproject/finch"}),", usable anywhere."]}),`
`,e.jsxs(a.li,{children:[e.jsxs(a.strong,{children:[e.jsx(a.code,{children:"useTiled*"})," react-query hooks"]})," — declarative data-fetching hooks, also exported from ",e.jsx(a.code,{children:"@blueskyproject/finch"}),"."]}),`
`]}),`
`,e.jsxs(a.p,{children:["Both surfaces read their base URL and API key from ",e.jsx(a.code,{children:"FinchConfigProvider"}),". See the ",e.jsx(a.strong,{children:"Configuration"})," page for setup."]}),`
`,e.jsx(a.hr,{}),`
`,e.jsxs(a.h2,{id:"public-api--tiled-namespace",children:["Public API — ",e.jsx(a.code,{children:"Tiled.*"})," namespace"]}),`
`,e.jsxs(a.p,{children:["Import the ",e.jsx(a.code,{children:"Tiled"})," object from ",e.jsx(a.code,{children:"@blueskyproject/finch"})," and call its async functions directly."]}),`
`,e.jsx(a.pre,{children:e.jsx(a.code,{className:"language-tsx",children:`import { Tiled } from '@blueskyproject/finch';
`})}),`
`,e.jsx(a.h3,{id:"search",children:"Search"}),`
`,e.jsx(a.pre,{children:e.jsx(a.code,{className:"language-tsx",children:`// Search by Bluesky spec tags
const results = await Tiled.searchBySpecs(['BlueskyRun'], { path: '/my-catalog' });

// Full-text search across metadata
const results = await Tiled.searchByFulltext('sample-name', '/my-catalog');

// Match a metadata key exactly
const results = await Tiled.searchByMetadataEquals('plan_name', 'count', '/my-catalog');

// Metadata comparison (gt, gte, lt, lte)
const results = await Tiled.searchByMetadataComparison('num_points', 'gt', '10', '/my-catalog');

// Regex match on a metadata key
const results = await Tiled.searchByRegex('sample_name', '^Au.*', false, '/my-catalog');

// Filter by data structure family
const results = await Tiled.searchByStructureFamily('table', '/my-catalog');
`})}),`
`,e.jsx(a.h3,{id:"data-retrieval",children:"Data retrieval"}),`
`,e.jsx(a.pre,{children:e.jsx(a.code,{className:"language-tsx",children:`// Item metadata
const meta = await Tiled.getItemMetadata('/my-catalog/run-uid');

// Bluesky plan metadata (structured)
const planMeta = await Tiled.getBlueskyPlanMetadata('/my-catalog/run-uid');

// Table data
const rows = await Tiled.getTableDataAsSequence('/my-catalog/run-uid/primary/data', 0);
const json = await Tiled.getTableDataAsJson('/my-catalog/run-uid/primary/data', 0);

// Structured array / xarray
const array = await Tiled.getStructuredArrayData('/my-catalog/run-uid/primary/data/det', 0);
const xarrayData = await Tiled.getXArrayData('/my-catalog/run-uid/primary/data/det', [0, 0]);
`})}),`
`,e.jsx(a.h3,{id:"server",children:"Server"}),`
`,e.jsx(a.pre,{children:e.jsx(a.code,{className:"language-tsx",children:`const info = await Tiled.getServerInfo();
console.log(info.library_version);
`})}),`
`,e.jsx(a.h3,{id:"image-helpers",children:"Image helpers"}),`
`,e.jsx(a.pre,{children:e.jsx(a.code,{className:"language-tsx",children:`// Build an authenticated PNG URL for a 2D array node
const url = Tiled.generateFullImagePngPath('/my-catalog/run-uid/primary/data/det');

// Fetch image bytes with authentication header applied
const blob = await Tiled.getAuthenticatedImage(url);
`})}),`
`,e.jsx(a.h3,{id:"configuration",children:"Configuration"}),`
`,e.jsx(a.pre,{children:e.jsx(a.code,{className:"language-tsx",children:`// Set a global path prefix used by all subsequent requests
Tiled.setInitialPath('/my-catalog');

// Retrieve the current base URL (from FinchConfigProvider)
const url = Tiled.getDefaultUrl();

// Set a bearer token for requests that need explicit auth
Tiled.setBearerToken('my-api-key');

// Register a callback invoked when any request returns 401
Tiled.setAuthErrorCallback(() => redirectToLogin());

// Reverse sort order for search results
Tiled.setReverseSort(true);

// Reset all global state (path, sort, token)
Tiled.resetGlobalState();
`})}),`
`,e.jsx(a.hr,{}),`
`,e.jsx(a.h2,{id:"react-query-hooks",children:"react-query hooks"}),`
`,e.jsxs(a.p,{children:["All ",e.jsx(a.code,{children:"useTiled*"})," hooks are exported from ",e.jsx(a.code,{children:"@blueskyproject/finch"})," and require ",e.jsx(a.code,{children:"QueryClientProvider"})," to be mounted."]}),`
`,e.jsx(a.pre,{children:e.jsx(a.code,{className:"language-tsx",children:`import {
  useTiledSearchBySpecsQuery,
  useTiledItemMetadataQuery,
} from '@blueskyproject/finch';
`})}),`
`,e.jsxs(a.p,{children:["All hooks accept an optional ",e.jsx(a.code,{children:"queryOptions"})," argument passed through to react-query's ",e.jsx(a.code,{children:"useQuery"}),"."]}),`
`,e.jsx(a.hr,{}),`
`,e.jsx(a.h3,{id:"search-hooks",children:"Search hooks"}),`
`,e.jsx(a.h4,{id:"usetiledsearchresultsquery",children:e.jsx(a.code,{children:"useTiledSearchResultsQuery"})}),`
`,e.jsxs(a.p,{children:["Full-config search using a ",e.jsx(a.code,{children:"TiledSearchConfig"})," object (excluding ",e.jsx(a.code,{children:"baseUrl"})," and ",e.jsx(a.code,{children:"apiKey"}),", which are injected automatically from ",e.jsx(a.code,{children:"FinchConfigProvider"}),")."]}),`
`,e.jsx(a.pre,{children:e.jsx(a.code,{className:"language-tsx",children:`const { data } = useTiledSearchResultsQuery({
  path: '/my-catalog',
  specs: ['BlueskyRun'],
  offset: 0,
  limit: 20,
});
`})}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Query key:"})," ",e.jsx(a.code,{children:"['tiled', 'search', baseUrl, config]"})]}),`
`,e.jsx(a.hr,{}),`
`,e.jsx(a.h4,{id:"usetiledsearchbyidquery",children:e.jsx(a.code,{children:"useTiledSearchByIdQuery"})}),`
`,e.jsxs(a.p,{children:["Like ",e.jsx(a.code,{children:"useTiledSearchResultsQuery"})," but returns ",e.jsx(a.code,{children:"null"})," instead of throwing on a 404. Useful when the existence of an item is uncertain."]}),`
`,e.jsx(a.pre,{children:e.jsx(a.code,{className:"language-tsx",children:`const { data } = useTiledSearchByIdQuery({ path: '/my-catalog/some-uid' });
// data is TiledSearchResult | null
`})}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Query key:"})," ",e.jsx(a.code,{children:"['tiled', 'searchById', baseUrl, config]"})]}),`
`,e.jsx(a.hr,{}),`
`,e.jsx(a.h4,{id:"usetiledsearchbyspecsquery",children:e.jsx(a.code,{children:"useTiledSearchBySpecsQuery"})}),`
`,e.jsx(a.p,{children:"Search by Bluesky spec tags."}),`
`,e.jsx(a.pre,{children:e.jsx(a.code,{className:"language-tsx",children:`const { data } = useTiledSearchBySpecsQuery(
  ['BlueskyRun'],     // include specs
  [],                 // exclude specs
  '/my-catalog',      // path
  { limit: 50 },      // TiledSearchOptions
);
`})}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Parameters:"})," ",e.jsx(a.code,{children:"(include: string[], exclude?, path?, options?, queryOptions?)"})]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Query key:"})," ",e.jsx(a.code,{children:"['tiled', 'searchBySpecs', baseUrl, include, exclude, path, options]"})]}),`
`,e.jsx(a.hr,{}),`
`,e.jsx(a.h4,{id:"usetiledsearchbyfulltextquery",children:e.jsx(a.code,{children:"useTiledSearchByFulltextQuery"})}),`
`,e.jsxs(a.p,{children:["Full-text search across all metadata fields. Auto-disabled when ",e.jsx(a.code,{children:"text"})," is an empty string."]}),`
`,e.jsx(a.pre,{children:e.jsx(a.code,{className:"language-tsx",children:`const { data } = useTiledSearchByFulltextQuery('gold nanoparticles', '/my-catalog');
`})}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Parameters:"})," ",e.jsx(a.code,{children:"(text: string, path?, options?, queryOptions?)"})]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Query key:"})," ",e.jsx(a.code,{children:"['tiled', 'searchByFulltext', baseUrl, text, path, options]"})]}),`
`,e.jsx(a.hr,{}),`
`,e.jsx(a.h4,{id:"usetiledsearchbymetadataequalsquery",children:e.jsx(a.code,{children:"useTiledSearchByMetadataEqualsQuery"})}),`
`,e.jsx(a.p,{children:"Exact match on a metadata key."}),`
`,e.jsx(a.pre,{children:e.jsx(a.code,{className:"language-tsx",children:`const { data } = useTiledSearchByMetadataEqualsQuery('plan_name', 'count', '/my-catalog');
`})}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Parameters:"})," ",e.jsx(a.code,{children:"(key: string, value: string, path?, options?, queryOptions?)"})]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Query key:"})," ",e.jsx(a.code,{children:"['tiled', 'searchByMetadataEquals', baseUrl, key, value, path, options]"})]}),`
`,e.jsx(a.hr,{}),`
`,e.jsx(a.h4,{id:"usetiledsearchbymetadatacomparisonquery",children:e.jsx(a.code,{children:"useTiledSearchByMetadataComparisonQuery"})}),`
`,e.jsxs(a.p,{children:["Numeric comparison on a metadata key. Operator is one of ",e.jsx(a.code,{children:"'gt' | 'gte' | 'lt' | 'lte'"}),"."]}),`
`,e.jsx(a.pre,{children:e.jsx(a.code,{className:"language-tsx",children:`const { data } = useTiledSearchByMetadataComparisonQuery(
  'num_points', 'gt', '10', '/my-catalog',
);
`})}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Parameters:"})," ",e.jsx(a.code,{children:"(key: string, operator: 'gt'|'gte'|'lt'|'lte', value: string, path?, options?, queryOptions?)"})]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Query key:"})," ",e.jsx(a.code,{children:"['tiled', 'searchByMetadataComparison', baseUrl, key, operator, value, path, options]"})]}),`
`,e.jsx(a.hr,{}),`
`,e.jsx(a.h4,{id:"usetiledsearchbyregexquery",children:e.jsx(a.code,{children:"useTiledSearchByRegexQuery"})}),`
`,e.jsx(a.p,{children:"Regex match on a metadata key."}),`
`,e.jsx(a.pre,{children:e.jsx(a.code,{className:"language-tsx",children:`const { data } = useTiledSearchByRegexQuery(
  'sample_name', '^Au.*', false, '/my-catalog',
);
`})}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Parameters:"})," ",e.jsx(a.code,{children:"(key: string, pattern: string, caseSensitive?, path?, options?, queryOptions?)"})]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Query key:"})," ",e.jsx(a.code,{children:"['tiled', 'searchByRegex', baseUrl, key, pattern, caseSensitive, path, options]"})]}),`
`,e.jsx(a.hr,{}),`
`,e.jsx(a.h4,{id:"usetiledsearchbystructurefamilyquery",children:e.jsx(a.code,{children:"useTiledSearchByStructureFamilyQuery"})}),`
`,e.jsxs(a.p,{children:["Filter results by Tiled structure family. Valid values: ",e.jsx(a.code,{children:"'container' | 'array' | 'table' | 'awkward' | 'sparse'"}),"."]}),`
`,e.jsx(a.pre,{children:e.jsx(a.code,{className:"language-tsx",children:`const { data } = useTiledSearchByStructureFamilyQuery('table', '/my-catalog');
`})}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Parameters:"})," ",e.jsx(a.code,{children:"(structureFamily: string, path?, options?, queryOptions?)"})]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Query key:"})," ",e.jsx(a.code,{children:"['tiled', 'searchByStructureFamily', baseUrl, structureFamily, path, options]"})]}),`
`,e.jsx(a.hr,{}),`
`,e.jsx(a.h3,{id:"item-data-hooks",children:"Item data hooks"}),`
`,e.jsxs(a.p,{children:["All item data hooks are auto-disabled when ",e.jsx(a.code,{children:"searchPath"})," is an empty string."]}),`
`,e.jsx(a.h4,{id:"usetileditemmetadataquery",children:e.jsx(a.code,{children:"useTiledItemMetadataQuery"})}),`
`,e.jsx(a.p,{children:"Fetches raw Tiled metadata for a node."}),`
`,e.jsx(a.pre,{children:e.jsx(a.code,{className:"language-tsx",children:`const { data: meta } = useTiledItemMetadataQuery('/my-catalog/run-uid');
`})}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Query key:"})," ",e.jsx(a.code,{children:"['tiled', 'itemMetadata', baseUrl, searchPath]"})]}),`
`,e.jsx(a.hr,{}),`
`,e.jsx(a.h4,{id:"usetiledblueskyplanmetadataquery",children:e.jsx(a.code,{children:"useTiledBlueskyPlanMetadataQuery"})}),`
`,e.jsxs(a.p,{children:["Fetches structured Bluesky plan metadata (",e.jsx(a.code,{children:"start"}),", ",e.jsx(a.code,{children:"stop"}),", ",e.jsx(a.code,{children:"descriptors"}),")."]}),`
`,e.jsx(a.pre,{children:e.jsx(a.code,{className:"language-tsx",children:`const { data: planMeta } = useTiledBlueskyPlanMetadataQuery('/my-catalog/run-uid');

console.log(planMeta?.start?.plan_name);
console.log(planMeta?.stop?.exit_status);
`})}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Query key:"})," ",e.jsx(a.code,{children:"['tiled', 'blueskyPlanMetadata', baseUrl, searchPath]"})]}),`
`,e.jsx(a.hr,{}),`
`,e.jsx(a.h4,{id:"usetiledtabledataassequencequery",children:e.jsx(a.code,{children:"useTiledTableDataAsSequenceQuery"})}),`
`,e.jsx(a.p,{children:"Fetches a table partition as an array of row objects."}),`
`,e.jsx(a.pre,{children:e.jsx(a.code,{className:"language-tsx",children:`const { data: rows } = useTiledTableDataAsSequenceQuery(
  '/my-catalog/run-uid/primary/data',
  0, // partition index
);
// rows: TiledTableRow[] | null
`})}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Parameters:"})," ",e.jsx(a.code,{children:"(searchPath: string, partition: number, queryOptions?)"})]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Query key:"})," ",e.jsx(a.code,{children:"['tiled', 'tableDataAsSequence', baseUrl, searchPath, partition]"})]}),`
`,e.jsx(a.hr,{}),`
`,e.jsx(a.h4,{id:"usetiledtabledataasjsonquery",children:e.jsx(a.code,{children:"useTiledTableDataAsJsonQuery"})}),`
`,e.jsx(a.p,{children:"Fetches a table partition as a columnar JSON object (column name → array of values)."}),`
`,e.jsx(a.pre,{children:e.jsx(a.code,{className:"language-tsx",children:`const { data } = useTiledTableDataAsJsonQuery('/my-catalog/run-uid/primary/data', 0);
// data: TiledTableJSONResponse | null
// e.g. { det: [1.0, 2.0, 3.0], motor: [0, 1, 2] }
`})}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Parameters:"})," ",e.jsx(a.code,{children:"(searchPath: string, partition: number, queryOptions?)"})]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Query key:"})," ",e.jsx(a.code,{children:"['tiled', 'tableDataAsJson', baseUrl, searchPath, partition]"})]}),`
`,e.jsx(a.hr,{}),`
`,e.jsx(a.h4,{id:"usetiledstructuredarraydataquery",children:e.jsx(a.code,{children:"useTiledStructuredArrayDataQuery"})}),`
`,e.jsx(a.p,{children:"Fetches a block of structured (named-column) array data."}),`
`,e.jsx(a.pre,{children:e.jsx(a.code,{className:"language-tsx",children:`const { data } = useTiledStructuredArrayDataQuery('/my-catalog/run-uid/primary/data/det', 0);
`})}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Parameters:"})," ",e.jsx(a.code,{children:"(searchPath: string, block: number, queryOptions?)"})]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Query key:"})," ",e.jsx(a.code,{children:"['tiled', 'structuredArrayData', baseUrl, searchPath, block]"})]}),`
`,e.jsx(a.hr,{}),`
`,e.jsx(a.h4,{id:"usetiledxarraydataquery",children:e.jsx(a.code,{children:"useTiledXArrayDataQuery"})}),`
`,e.jsx(a.p,{children:"Fetches a slice of an N-dimensional array using a stack index array."}),`
`,e.jsx(a.pre,{children:e.jsx(a.code,{className:"language-tsx",children:`const { data: frame } = useTiledXArrayDataQuery(
  '/my-catalog/run-uid/primary/data/det',
  [0, 0], // stack indices for each dimension beyond the last two
);
// data: number[][] | null
`})}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Parameters:"})," ",e.jsx(a.code,{children:"(searchPath: string, stack: number[], queryOptions?)"})]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Query key:"})," ",e.jsx(a.code,{children:"['tiled', 'xArrayData', baseUrl, searchPath, stack]"})]}),`
`,e.jsx(a.hr,{}),`
`,e.jsx(a.h3,{id:"server-info-hook",children:"Server info hook"}),`
`,e.jsx(a.h4,{id:"usetiledserverinfoquery",children:e.jsx(a.code,{children:"useTiledServerInfoQuery"})}),`
`,e.jsx(a.p,{children:"Returns Tiled server version and API metadata."}),`
`,e.jsx(a.pre,{children:e.jsx(a.code,{className:"language-tsx",children:`const { data: info } = useTiledServerInfoQuery();
console.log(info?.library_version);
`})}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Query key:"})," ",e.jsx(a.code,{children:"['tiled', 'serverInfo', baseUrl]"})]}),`
`,e.jsx(a.hr,{}),`
`,e.jsx(a.h2,{id:"combined-example",children:"Combined example"}),`
`,e.jsx(a.p,{children:"Searching for runs and loading table data for the selected one:"}),`
`,e.jsx(a.pre,{children:e.jsx(a.code,{className:"language-tsx",children:`import { useState } from 'react';
import {
  useTiledSearchBySpecsQuery,
  useTiledTableDataAsJsonQuery,
} from '@blueskyproject/finch';

function RunBrowser() {
  const [selectedPath, setSelectedPath] = useState('');

  const { data: runs } = useTiledSearchBySpecsQuery(['BlueskyRun'], [], '/my-catalog');

  const { data: tableData } = useTiledTableDataAsJsonQuery(
    selectedPath ? \`\${selectedPath}/primary/data\` : '',
    0,
  );

  return (
    <div>
      <ul>
        {runs?.data?.map((run) => (
          <li key={run.id}>
            <button onClick={() => setSelectedPath(run.links?.self ?? '')}>
              {run.id}
            </button>
          </li>
        ))}
      </ul>

      {tableData && (
        <pre>{JSON.stringify(Object.keys(tableData), null, 2)}</pre>
      )}
    </div>
  );
}
`})})]})}function m(n={}){const{wrapper:a}={...r(),...n.components};return a?e.jsx(a,{...n,children:e.jsx(s,{...n})}):s(n)}export{m as default};
