import { QServerApiProvider } from '@/api/qServerRuntime';
import {
    createQServerSim,
    createQServerSimClient,
    createQServerSimSocketFactory,
    device,
    deviceAnnotation,
    deviceListAnnotation,
    parameter,
    plan,
    QServerSimProvider,
    queueItem,
} from '@/lib/qserver-sim';
import QServerSimDemo from '@/components/QServerSimDemo/QServerSimDemo';

/**
 * Live, self-contained demo embedded in the "QServer Sim" documentation page.
 *
 * Deliberately built with a *custom* catalog rather than the Finch defaults, so the page shows the
 * same thing it tells you to do: define your own plans and devices, seed a queue, and mount the
 * two providers. Runs take 2.5 s of simulated time and progress on their own while this page is
 * open — no RE Manager, no network.
 */
const DETECTORS = ['I0', 'diode'];

const docSim = createQServerSim({
    plans: {
        xafs_scan: plan({
            name: 'xafs_scan',
            module: 'demo.plans',
            description: 'Mock XAFS energy scan.',
            parameters: [
                parameter({ name: 'energy_start', description: 'eV', default: '7000' }),
                parameter({ name: 'energy_stop', description: 'eV', default: '7200' }),
                parameter({ name: 'num', description: 'number of points', default: '101' }),
                parameter({ name: 'detector', annotation: deviceAnnotation(DETECTORS) }),
            ],
        }),
        align_beamstop: plan({
            name: 'align_beamstop',
            module: 'demo.plans',
            description: 'Mock beamstop alignment.',
            parameters: [
                parameter({ name: 'detectors', annotation: deviceListAnnotation(DETECTORS) }),
                parameter({ name: 'motor', annotation: deviceAnnotation(['beamstop_x']) }),
            ],
        }),
    },
    devices: {
        I0: device({ name: 'I0', type: 'detector' }),
        diode: device({ name: 'diode', type: 'detector' }),
        energy: device({ name: 'energy', type: 'motor' }),
        beamstop_x: device({ name: 'beamstop_x', type: 'motor' }),
    },
    queue: [
        queueItem({
            name: 'xafs_scan',
            itemUid: 'doc-item-1',
            kwargs: { energy_start: 7000, energy_stop: 7200, num: 101, detector: 'I0' },
        }),
        queueItem({
            name: 'align_beamstop',
            itemUid: 'doc-item-2',
            kwargs: { detectors: ['diode'], motor: 'beamstop_x' },
        }),
    ],
    runDurationMs: 2500,
    environmentOpenMs: 0,
    // Start closed and open it below, so the console has the worker-startup narration in it by the
    // time the page loads — otherwise the panel is empty until someone presses a button.
    environmentState: 'closed',
});

docSim.openEnvironment();

const docClient = createQServerSimClient(docSim);
// Without this the console panel would try to open a real websocket and sit at "connecting".
const docSocketFactory = createQServerSimSocketFactory(docSim);

export default function QServerSimDocDemo() {
    return (
        <QServerSimProvider sim={docSim}>
            <QServerApiProvider client={docClient} socketFactory={docSocketFactory}>
                <QServerSimDemo />
            </QServerApiProvider>
        </QServerSimProvider>
    );
}
