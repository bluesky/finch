import { useState } from 'react';

import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Main from '../../components/Main';
import Widget from '../../components/Widget';
import SidebarItem from '../../components/SidebarItem';
import InputSlider from '../../components/InputSlider';
import InputSliderRange from 'src/components/InputSliderRange';

const icons = {
    cubeTransparent: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 7.5-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25"
            />
        </svg>
    ),
    adjustmentsVertical: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5"
            />
        </svg>
    ),
    chartBar: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
            />
        </svg>
    ),
};

export default function SamplePage1() {
    const [age, setAge] = useState(45);
    const [ageRange, setAgeRange] = useState<[number, number]>([20, 50]);
    return (
        <div className="w-full h-screen">
            <Header title="Sample App With Widgets" />
            <div className="flex ">
                <Sidebar className="bg-slate-300" title="Sample Sidebar" collapsible={true}>
                    <SidebarItem title="With Icon" icon={icons.adjustmentsVertical}>
                        <>
                            <InputSliderRange
                                min={0}
                                max={100}
                                value={ageRange}
                                onChange={setAgeRange}
                                marks={[0, 25, 50, 80, 90, 100]}
                                units="years"
                                shorthandUnits="yr"
                            />
                            <InputSlider
                                min={0}
                                max={100}
                                value={age}
                                onChange={setAge}
                                marks={[0, 25, 50, 80, 90, 100]}
                                label="Age"
                                units="years"
                                shorthandUnits="yr"
                                showFill={true}
                            />
                            <InputSlider
                                min={0}
                                max={100}
                                value={age}
                                onChange={setAge}
                                marks={[0, 25, 50, 80, 90, 100]}
                                units="years"
                                showSideInput={false}
                                shorthandUnits="yr"
                            />
                        </>
                    </SidebarItem>
                    <SidebarItem title="With Icon" icon={icons.chartBar}>
                        <p>stuff</p>
                    </SidebarItem>
                    <SidebarItem title="With Icon" icon={icons.cubeTransparent}>
                        <p>stuff</p>
                    </SidebarItem>
                </Sidebar>
                <Main flexWrap={true}>
                    <>
                        <p>{age}</p>
                        <Widget title="My Widget">
                            <div className="flex-col w-full">
                                <InputSliderRange
                                    min={0}
                                    max={100}
                                    value={ageRange}
                                    onChange={setAgeRange}
                                    marks={[0, 25, 50, 80, 90, 100]}
                                    units="years"
                                    shorthandUnits="yr"
                                />

                                <InputSlider
                                    min={0}
                                    max={100}
                                    value={age}
                                    onChange={setAge}
                                    marks={[0, 25, 50, 80, 90, 100]}
                                    label="Age"
                                    units="years"
                                    shorthandUnits="yr"
                                    showFill={true}
                                />
                                <InputSlider
                                    min={0}
                                    max={100}
                                    value={age}
                                    onChange={setAge}
                                    marks={[0, 25, 50, 80, 90, 100]}
                                    units="years"
                                    showSideInput={false}
                                    shorthandUnits="yr"
                                />
                            </div>
                        </Widget>
                        <Widget title="My Widget">
                            <InputSlider
                                min={0}
                                max={100}
                                value={age}
                                onChange={setAge}
                                marks={[0, 1, 2, 3, 4, 5]}
                                label="Age"
                            />
                        </Widget>
                    </>
                </Main>
            </div>
        </div>
    );
}
