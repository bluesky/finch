import { TiledSearchItem, SparseStructure } from './types';

export default function PreviewSparse({
    sparseItem,
}: {
    sparseItem: TiledSearchItem<SparseStructure>;
}) {
    console.log({ sparseItem });
    return (
        <div className="w-full flex flex-col items-center space-y-8 py-8">
            <h2 className="text-lg font-semibold mx-4">
                You've clicked a sparse item! We don't have a preview for this yet...
            </h2>
            <div className="w-full flex flex-col items-center">
                <p className="text-sm">Sparse item ID: {sparseItem.id}</p>
            </div>
        </div>
    );
}
