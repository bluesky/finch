import { useEffect, useRef, useState } from 'react';
import QItem from './QItem';
import dayjs from 'dayjs';
import './styles/qserver.css';
import { PopupItem } from './types/types';
import { HistoryItem } from '@/api/qServer/types';

type QSListProps = {
    queueData: PopupItem[] | HistoryItem[];
    handleQItemClick: (arg: PopupItem | HistoryItem, showDeleteButton: boolean) => void;
    type: 'default' | 'history' | 'short';
};
export default function QSList({
    queueData = [],
    handleQItemClick = () => {},
    type = 'default',
}: QSListProps) {
    const defaultVisibleHistoryItems = 20;
    const [visibleItems, setVisibleItems] = useState(defaultVisibleHistoryItems); // Start with 10 items
    const listRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const scrollToTop = () => {
            if (listRef.current) {
                listRef.current.scrollTop = -listRef.current.scrollHeight; // Scroll to the top
            }
        };

        // Using setTimeout to ensure the DOM has fully rendered
        const timeoutId = setTimeout(scrollToTop, 0);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [queueData]);

    useEffect(() => {
        const loadMoreItems = () => {
            setVisibleItems((prev) => prev + defaultVisibleHistoryItems);
        };
        const handleScroll = () => {
            if (listRef.current) {
                const { scrollTop, scrollHeight, clientHeight } = listRef.current;
                console.log({ scrollTop, scrollHeight, clientHeight });
                if (scrollTop + clientHeight >= scrollHeight - 20) {
                    loadMoreItems();
                }
            }
        };
        const ref = listRef.current;
        if (type === 'history') {
            if (listRef.current) {
                listRef.current.addEventListener('scroll', handleScroll);
            }
        }
        return () => {
            if (ref) {
                console.log('removing scroll event listener');
                ref.removeEventListener('scroll', handleScroll);
            }
        };
    }, [type]);

    if (type === 'default') {
        return (
            <section className="">
                <h2 className="text-white text-xl text-center">Queue Items</h2>
                <ul className="flex flex-row-reverse mt-2 justify-evenly overflow-auto scrollbar-always-visible">
                    {queueData.map((item, index) => (
                        <QItem
                            type="current"
                            item={item}
                            label={index.toString()}
                            key={item.item_uid}
                            handleClick={() => handleQItemClick(item, true)}
                        />
                    ))}
                    {queueData.length < 6
                        ? [...new Array(6 - queueData.length)].map((item, index) => (
                              <QItem type="blank" item={item} key={index} />
                          ))
                        : ''}
                </ul>
            </section>
        );
    } else if (type === 'history') {
        const showDeleteButton = false;
        return (
            <div
                ref={listRef}
                className="flex-grow overflow-auto scrollbar-always-visible mx-1 mb-1"
            >
                <section className="w-full flex flex-col ">
                    <ul className="flex flex-wrap-reverse justify-center">
                        {queueData.slice(queueData.length - visibleItems).map((item) => (
                            <QItem
                                type="history"
                                item={item}
                                label={
                                    'result' in item
                                        ? dayjs(
                                              item?.result && item.result.time_stop * 1000,
                                          ).format('MM/DD hh:mm a')
                                        : ''
                                }
                                key={item.item_uid}
                                handleClick={() => handleQItemClick(item, showDeleteButton)}
                            />
                        ))}
                    </ul>
                </section>
            </div>
        );
    } else if (type === 'short') {
        return (
            <section className="w-full">
                <ul className="flex flex-wrap-reverse justify-center items-end">
                    {queueData.map((item, index) => (
                        <QItem
                            type="current"
                            item={item}
                            label={index.toString()}
                            key={item.item_uid}
                            handleClick={() => handleQItemClick(item, true)}
                        />
                    ))}
                    {queueData.length < 0
                        ? [...new Array(0 - queueData.length)].map((item, index) => (
                              <QItem type="blank" item={item} key={index} />
                          ))
                        : ''}
                    <QItem type="blank" item={null} />
                </ul>
            </section>
        );
    }
}
