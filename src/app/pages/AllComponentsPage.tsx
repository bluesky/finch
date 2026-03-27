import { useState } from "react";
import ComponentViewerExampleReal from "@/features/ComponentViewer/ComponentViewerExampleReal";
import ComponentViewerExampleSim from "@/features/ComponentViewer/ComponentViewerExampleSim";
import { Cube, CubeTransparent } from "@phosphor-icons/react";


export default function AllComponentsPage() {
    const [ mode, setMode ] = useState<'real' | 'sim'>('sim');
    return (
        <section>
            
        </section>
    )

    if (mode === 'real') {
        return <ComponentViewerExampleReal />
    } else {
        return <ComponentViewerExampleSim />
    }
}