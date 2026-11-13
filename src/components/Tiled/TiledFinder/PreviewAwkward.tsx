import { TiledSearchItem, AwkwardStructure } from './types';

export default function PreviewAwkward({
    awkwardItem,
}: {
    awkwardItem: TiledSearchItem<AwkwardStructure>;
}) {
    console.log({ awkwardItem });
    return (
        <div className="w-full flex flex-col items-center space-y-8 py-8">
            <h2 className="text-lg font-semibold mx-4">
                You've clicked an awkward item! We don't have a preview for this yet...
            </h2>
            <div className="w-full flex flex-col items-center">
                <p className="text-sm">Awkward item ID: {awkwardItem.id}</p>
            </div>
        </div>
    );
}
