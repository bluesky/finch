import { useState, useRef, useEffect } from 'react';
import { WidgetStyleProps } from './Widget';
import { useOphydApiUrls } from 'src/utils/apiUtils';
import './styles/qserver.css';

import dayjs from 'dayjs';

//import ToggleSlider from '../library/ToggleSlider'; //to do  - see if this can be refactored to include the functionality for turning off if connection fails
type ConsoleMessage = {
    mainText: string;
    bracketText: string;
    time: string;
    id: number;
};

type QSConsoleProps = WidgetStyleProps & {
    processConsoleMessage: (message: string) => void;
};
export default function QSConsole({ processConsoleMessage = () => {} }: QSConsoleProps) {
    const [wsMessages, setWsMessages] = useState<ConsoleMessage[]>([]); //text for the websocket output
    const [isOpened, setIsOpened] = useState(false); //boolean representing status of WS connection
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [isToggleOn, setIsToggleOn] = useState(false); //toggle UI switch for turning output on and off
    const connection = useRef<WebSocket | null>(null); //queue server WS via FastAPI
    const { getWsUrl } = useOphydApiUrls();
    const wsUrl = getWsUrl('qs-console-socket'); //this comes from the ophyd api, not the queue server.
    const messageContainerRef = useRef<HTMLDivElement | null>(null);
    const hasErrorOccuredRef = useRef(false);
    const didUserTurnOffWS = useRef(false);

    const toggleSwitch = () => {
        if (isToggleOn) {
            handleCloseWS();
        } else {
            handleOpenWS();
        }
        setIsToggleOn(!isToggleOn);
    };

    const handleWebSocketMessage = (event: MessageEvent) => {
        //console.log('received message from ws');
        //this function receives the websocket message and displays it to the client
        const eventData = JSON.parse(event.data) as Record<string, string>;
        //console.log({eventData});
        if ('msg' in eventData) {
            //update the console with the messages, add new message to existing
            setWsMessages((messages) => {
                //console.log({messages});
                if (eventData.msg === '\n') return messages;

                let id = 0;
                if (messages.length > 0) id = messages.length;
                let timeStamp;
                if ('time' in eventData) {
                    timeStamp = dayjs.unix(parseFloat(eventData.time)).format('hh:mm:ss::SSS a');
                } else {
                    timeStamp = dayjs().format('hh:mm:ss::SSS a');
                }

                //process the message, sometimes it contains "[ date and service ] ...." at the
                //start of the message which becomes difficult to read
                let bracketText = '';
                let mainText = '';
                if (eventData.msg.startsWith('[')) {
                    const closingBracketIndex = eventData.msg.indexOf(']');
                    bracketText = eventData.msg.slice(0, closingBracketIndex + 1);
                    mainText = eventData.msg.slice(closingBracketIndex + 1);
                } else {
                    if (eventData.msg !== '\n') {
                        mainText = eventData.msg;
                    }
                }
                //console.log({bracketText});
                //console.log({mainText});
                processConsoleMessage(mainText.trim()); //check keywords, update other React state if matches found
                const newMessage = {
                    mainText: mainText,
                    bracketText: bracketText,
                    time: timeStamp,
                    id: id,
                };

                return [...messages, newMessage];
            });
        }
    };

    const closeWebSocket = (connection: React.MutableRefObject<WebSocket | null>) => {
        if (connection.current !== null) {
            try {
                console.log('Attempting to close existing connection');
                connection.current.close();
                console.log('Existing websocket connection closed');
                setStatusMessage('Closed connection ' + dayjs().format('HH:MM A'));
            } catch (error) {
                console.log(
                    'Unable to properly close existing websocket connection, still setting connection.current=null',
                );
                console.log({ error });
                setStatusMessage(
                    'Encountered error on closing websocket, forcefully removed connection at ' +
                        dayjs().format('HH:MM A'),
                );
            }
            connection.current = null;
        } else {
            console.log('connection.current is null, removing websocket skipped');
        }
    };

    const initializeConnection = (
        wsUrl: string,
        connection: React.MutableRefObject<WebSocket | null>,
        _isOpened: boolean,
    ) => {
        //Ensure wsUrl is not empty
        if (wsUrl === '') {
            return;
        }

        closeWebSocket(connection);

        const socket = new WebSocket(wsUrl);

        setStatusMessage('Attempting WS Connection');

        socket.addEventListener('error', (error) => {
            alert(
                'Unable to establish connection to WS, check that the WS server is running and that the path/port are correct',
            );
            setStatusMessage(
                'Last connection attempt to websocket failed at ' + dayjs().format('HH:MM A'),
            );
            setIsToggleOn(false);
            console.log({ error });
            hasErrorOccuredRef.current = true;
        });

        //if websocket opens, add event listener for messages
        socket.addEventListener('open', (_event) => {
            setIsOpened(true);
            console.log('Opened connection in socket to: ' + wsUrl);
            setStatusMessage('Opened connection ' + dayjs().format('hh:mm A'));
            socket.addEventListener('message', handleWebSocketMessage);
            connection.current = socket;
        });

        //if websocket closes, attempt to reconnect & display a message
        socket.addEventListener('close', (_event) => {
            console.log('ws connection to fastapi server closed');
            setIsToggleOn(false);
            if (hasErrorOccuredRef.current === true) {
                //Either the fastAPI server stopped running, or the initial connection attempt failed
                //reset the ref
                hasErrorOccuredRef.current = false;
                setStatusMessage(
                    'Error occured during connection attempt at  ' + dayjs().format('hh:MM A'),
                );
            } else {
                //no error has occured, so the connection closed from user input or due to computer sleeping
                if (didUserTurnOffWS.current === false) {
                    //computer fell asleep
                    //attempt to reconnect WS
                    handleOpenWS();
                    setIsToggleOn(true);
                } else {
                    setStatusMessage(
                        'Manually disconnected from websocket at ' + dayjs().format('hh:MM A'),
                    );
                    //user turned off ws
                    //reset the ref
                    didUserTurnOffWS.current = false;
                }
            }
        });
    };

    const handleOpenWS = () => {
        initializeConnection(wsUrl, connection, isOpened);
    };

    const handleCloseWS = () => {
        didUserTurnOffWS.current = true;
        closeWebSocket(connection);
        setIsOpened(false);
    };

    useEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    }, [wsMessages]);

    useEffect(() => {
        toggleSwitch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <main className="h-full bg-white rounded-b-lg relative">
            {/* Toggle Switch & Status Header */}
            <div className="flex items-start justify-start space-x-12 pl-12 pt-1 absolute top-0 z-10">
                <div className="flex w-fit items-center space-x-2">
                    <p className={`${isToggleOn ? 'text-gray-400' : 'text-gray-800'}`}>OFF</p>
                    <button
                        onClick={toggleSwitch}
                        className={`w-16 h-5 flex items-center bg-gray-300 rounded-full px-1 cursor-pointer ${
                            isToggleOn ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                    >
                        <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                                isToggleOn ? 'translate-x-10' : 'translate-x-0'
                            }`}
                        ></div>
                    </button>
                    <p className={`${isToggleOn ? 'text-green-600' : 'text-gray-400'}`}>ON</p>
                </div>
                <p className="text-slate-500">{statusMessage}</p>
            </div>
            {/* Main Body */}
            <div className="h-full w-full rounded-b-lg absolute top-0 pt-8">
                <section
                    ref={messageContainerRef}
                    className="overflow-auto h-full w-full rounded-b-lg scrollbar-always-visible"
                >
                    {isOpened ? (
                        <p className="text-slate-400 pl-4">
                            Connection Opened. Listening for Queue Server console output.
                        </p>
                    ) : (
                        <p className="animate-pulse text-white pl-4">
                            Waiting for initialization...
                        </p>
                    )}
                    <ul className="flex flex-col">
                        {wsMessages.map((msg) => {
                            return (
                                <li key={msg.id} className="w-full flex text-slate-600">
                                    <p className="w-1/12 text-center text-slate-500"> {msg.id} </p>
                                    <p className="w-9/12">{msg.mainText}</p>
                                    <p className="w-1/6 text-sky-600 text-center">{msg.time}</p>
                                </li>
                            );
                        })}
                    </ul>
                </section>
            </div>
        </main>
    );
}
