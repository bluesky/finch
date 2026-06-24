//Any changes to this components name or file location will require manual updates to the Storybook About.mdx file which imports it
export function StorybookVersion() {
    return <span>v{import.meta.env.STORYBOOK_FINCH_VERSION}</span>;
}
