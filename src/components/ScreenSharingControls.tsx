import { Button, Flex } from "@mantine/core";
import { openModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../contexts/ws";
import { IResponse, ITechnology, IScreen, IWindow } from "../types";
import SelectModal from "./SelectModal";

interface ScreenSharingControlsProps {
    technologies?: ITechnology[];
    transmissionMode?: ITechnology;
    setTransmissionMode: (transmissionMode: ITechnology | undefined) => void;
    isMobile: boolean;
    setIsMobile: (isMobile: boolean) => void;
    stream?: MediaStream;
    setStream: (stream: MediaStream | undefined) => void;
    isStreaming: boolean;
    setIsStreaming: (isStreaming: boolean) => void;
}

export default function ScreenSharingControls({ technologies, transmissionMode, setTransmissionMode, isMobile, setIsMobile, stream, setStream, isStreaming, setIsStreaming }: ScreenSharingControlsProps): JSX.Element {
    const socket = useContext(SocketContext);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [screens, setScreens] = useState<IScreen[]>();
    const [windows, setWindows] = useState<IWindow[]>();

    useEffect(() => {
        // if isMobile and transmissionMode is VNC, update screens and windows
        if (!isMobile && transmissionMode === ITechnology.VNC) {
            socket.on("screens", ({ screens }) => {
                setScreens(screens);
            });

            socket.on("windows", ({ windows }) => {
                setWindows(windows);
            });
        } else {
            setScreens([]);
            setWindows([]);
            socket.off("screens");
            socket.off("windows");
        }

        // start stream if isMobile and transmissionMode is VNC
        if (isMobile && transmissionMode === ITechnology.VNC) {
            socket.emit("startStream", () => {
                setIsStreaming(true);

                showNotification({
                    title: "Streaming",
                    message: "Streaming started",
                    color: "green",
                })
            });
        }

        return () => {
            socket.off("role");
            socket.off("technologies");
            socket.off("screens");
            socket.off("windows");
        }
    }, [socket, isMobile, transmissionMode]);


    const tryTechnology = (technology: ITechnology): Promise<IResponse> => {
        return new Promise((resolve, reject) => {
            socket.emit("init", technology, ({ isConnected, isMobile, error }: IResponse) => {
                if (isConnected) {
                    resolve({ technology, isMobile });
                } else if (error) {
                    reject(error);
                }
            });
        })
    }

    const handleStart = () => {
        if (!technologies) {
            showNotification({
                title: "Error",
                message: "No technologies available",
                color: "red",
            });
            return;
        }

        technologies.reduce((promise, technology) => {
            return promise.catch(() => tryTechnology(technology))
        }, tryTechnology(technologies[0]))
            .then(({ technology, isMobile }: Pick<IResponse, "technology" | "isMobile">) => {
                if (technology) {
                    setTransmissionMode(technology);
                }

                if (isMobile) {
                    setIsMobile(true);
                }

                showNotification({
                    title: "Connected",
                    message: "Connected using " + technology + " technology",
                    color: "green",
                });

            })
            .catch(err => {
                showNotification({
                    title: "Error",
                    message: err,
                    color: "red",
                });
            })
            .finally(() => {
            });
    }

    const handlePopup = (activeTab: string) => {
        openModal({
            title: "Select screen or window",
            children: <SelectModal activeTab={activeTab} screens={screens} windows={windows} />
        })
    }

    const handleWEBRTC = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            setStream(stream);
            setIsStreaming(true);
        } catch (err) {
            console.log(err);
        }
    }

    const handlePause = () => {
        socket.emit("pause", () => {
            showNotification({
                title: isPaused ? 'Resumed' : 'Paused',
                message: isPaused ? 'Resumed sharing' : 'Paused sharing',
                color: isPaused ? 'grape' : 'yellow',
            })

            setIsPaused(!isPaused);
        });
    }

    const handleStop = () => {
        socket.emit("stop", () => {
            showNotification({
                title: 'Stopped',
                message: 'Stopped sharing',
                color: 'green',
            })
        });

        if (transmissionMode === ITechnology.WebRTC && stream) {
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
        }

        setTransmissionMode(undefined);
        setIsMobile(false);
        setWindows([]);
        setScreens([]);
        setIsPaused(false);
        setStream(undefined);
    }

    return (
        <Flex gap={"md"}>
            {
                transmissionMode ? (
                    <Button color="red" onClick={handleStop}>Stop</Button>
                ) : (
                    <Button color="green" onClick={handleStart}>Start</Button>
                )
            }

            {
                transmissionMode === ITechnology.VNC && !isMobile && (
                    <>
                        <Button onClick={() => handlePopup("screen")}>Select Screen</Button>
                        <Button onClick={() => handlePopup("window")}>Select Window</Button>
                    </>
                )
            }

            {
                transmissionMode === ITechnology.WebRTC && (
                    <>
                        <Button onClick={() => handleWEBRTC()}>Select Screen</Button>
                    </>
                )
            }

            {
                isStreaming && (
                    <Button color={isPaused ? "grape" : "yellow"} onClick={handlePause}>{isPaused ? 'Resume' : 'Pause'}</Button>
                )
            }

        </Flex>
    )
}