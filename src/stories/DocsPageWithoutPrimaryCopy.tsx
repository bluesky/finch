import {
    Controls,
    Description,
    Markdown,
    Primary,
    Stories,
    Subtitle,
    Title,
    useOf,
} from '@storybook/blocks';

/**
 * Storybook's default Docs page, minus the second copy of the primary story.
 *
 * By default the Stories list repeats the primary story, rendered with its
 * initial args. That copy ignores the Controls table, yet still picks up the
 * changed args the next time it re-renders on its own (after a click, say), so
 * it appears to update late. Leaving it out means the controls drive the only
 * copy on the page. Use as `parameters.docs.page` in a story's meta.
 *
 * Optional `parameters.docs.footer` (Markdown) is shown after the stories, for
 * integration notes that are not an example of their own.
 */
export default function DocsPageWithoutPrimaryCopy() {
    const { preparedMeta } = useOf('meta', ['meta']);
    const footer = (preparedMeta.parameters?.docs as { footer?: string } | undefined)?.footer;
    return (
        <>
            <Title />
            <Subtitle />
            <Description />
            <Primary />
            <Controls />
            <Stories includePrimary={false} />
            {footer && <Markdown>{footer}</Markdown>}
        </>
    );
}
