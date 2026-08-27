import type { Meta, StoryObj } from '@storybook/react';
import QServerSimDemo from '@/components/QServerSimDemo/QServerSimDemo';
import {
    defaultQServer,
    emptyQServer,
    errorQServer,
    pausedQServer,
    runningQServer,
    withQServerSim,
} from '@/lib/qserver-sim';

/**
 * A minimal exercise of the queue-server API client, running entirely against
 * **qserver-sim** — no RE Manager, no network.
 *
 * It shows what is queued, what has run, and lets you queue and start a plan. The component only
 * uses the client from `QServerApiProvider`, so what you see here is what it would do against a
 * real server.
 *
 * Each story gets its own simulator via the `withQServerSim` decorator, so they never interfere.
 * Runs progress on a real timer while a story is mounted (3 s each by default), and the component
 * polls once a second, so the tables move on their own.
 */
const meta = {
    title: 'Bluesky Components/QServerSimDemo',
    component: QServerSimDemo,
    tags: ['autodocs'],
    parameters: { layout: 'fullscreen' },
    decorators: [withQServerSim(defaultQServer)],
} satisfies Meta<typeof QServerSimDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Environment open and idle, three plans queued and two in history. */
export const Default: Story = {};

/**
 * A closed environment with an empty queue.
 *
 * "Run plan" queues the item but cannot start it — open the environment first, which is exactly
 * what a real server insists on.
 */
export const Empty: Story = {
    decorators: [withQServerSim(emptyQServer)],
};

/** A plan already executing, with two more queued behind it. Watch it drain. */
export const Running: Story = {
    decorators: [withQServerSim(runningQServer)],
};

/** A paused plan: progress is frozen until something resumes, stops, aborts or halts it. */
export const Paused: Story = {
    decorators: [withQServerSim(pausedQServer)],
};

/**
 * The next run is armed to fail. Start the queue and it lands in history with
 * `exit_status: 'failed'`, the item returns to the front of the queue, and the queue stops.
 */
export const Failing: Story = {
    decorators: [withQServerSim(errorQServer)],
};

/** Eight-second runs, for watching a single plan progress without it finishing immediately. */
export const SlowRuns: Story = {
    decorators: [withQServerSim(defaultQServer, { runDurationMs: 8000 })],
};

/**
 * 400 ms of simulated latency on every response.
 *
 * Latency delays the response only — the simulator's state changes immediately — so this is a way
 * to see how the UI behaves on a slow link without desynchronizing anything.
 */
export const SlowNetwork: Story = {
    decorators: [withQServerSim(defaultQServer, { latencyMs: 400 })],
};
