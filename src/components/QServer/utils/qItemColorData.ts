const colorList = [
    'bg-rose-800',
    'bg-rose-600',
    'bg-pink-800',
    'bg-pink-500',
    'bg-fuchsia-900',
    'bg-fuchsia-700',
    'bg-purple-950',
    'bg-purple-700',
    'bg-violet-900',
    'bg-violet-700',
    'bg-indigo-700',
    'bg-blue-700',
    'bg-sky-800',
    'bg-sky-700',
    'bg-cyan-800',
    'bg-teal-700',
    'bg-emerald-600',
    'bg-yellow-600',
    'bg-red-500',
];

//the opacity list must be hardcoded to be picked up by tailwind and included in the CSS
//tailwind classes cannot be dynamically generated at runtime
const colorListOpacity = [
    'bg-rose-800/40',
    'bg-rose-600/40',
    'bg-pink-800/40',
    'bg-pink-500/40',
    'bg-fuchsia-900/40',
    'bg-fuchsia-700/40',
    'bg-purple-950/40',
    'bg-purple-700/40',
    'bg-violet-900/40',
    'bg-violet-700/40',
    'bg-indigo-700/40',
    'bg-blue-700/40',
    'bg-sky-800/40',
    'bg-sky-700/40',
    'bg-cyan-800/40',
    'bg-teal-700/40',
    'bg-emerald-600/40',
    'bg-yellow-600/40',
    'bg-red-500/40',
];

const randomColor = (plan: string) => {
    const pseudoRandomInt = (plan.charCodeAt(0) + plan.length * 1000) % colorList.length;
    return colorList[pseudoRandomInt];
};

const randomColorOpacity = (plan: string) => {
    const pseudoRandomInt = (plan.charCodeAt(0) + plan.length * 1000) % colorListOpacity.length;
    return colorListOpacity[pseudoRandomInt];
};

const colorMap = {
    list_scan: 'bg-blue-300',
    count: 'bg-green-600',
    rel_spiral_fermat: 'bg-green-500',
    mv: 'bg-yellow-500',
    fly: 'bg-orange-500',
    grid_scan: 'bg-amber-800',
    align: 'bg-line-700',
    log_scan: 'bg-green-950',
    scan: 'bg-cyan-800',
};

const colorMapOpacity = {
    list_scan: 'bg-blue-300/40',
    count: 'bg-green-600/40',
    rel_spiral_fermat: 'bg-green-500/40',
    mv: 'bg-yellow-500/40',
    fly: 'bg-orange-500/40',
    grid_scan: 'bg-amber-800/40',
    align: 'bg-line-700/40',
    log_scan: 'bg-green-950/40',
    scan: 'bg-cyan-800/40',
};

const getPlanColor = (plan: string) => {
    if (plan in colorMap) {
        return colorMap[plan as keyof typeof colorMap];
    } else {
        return randomColor(plan);
    }
};

const getPlanColorOpacity = (plan: string) => {
    if (plan in colorMapOpacity) {
        return colorMapOpacity[plan as keyof typeof colorMapOpacity];
    } else {
        return randomColorOpacity(plan);
    }
};

export { getPlanColor, getPlanColorOpacity };
