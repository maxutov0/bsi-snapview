import { Box } from "@mantine/core";
import { useEffect, useRef } from "react";

interface StreamCanvasProps {
    title: string;
    stream?: MediaStream;
}

export default function StreamCanvas({ title, stream }: StreamCanvasProps): JSX.Element {
    const ref = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (ref.current && stream) {
            ref.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <Box>
            <h3>{title}</h3>
            <video ref={ref} style={{ backgroundColor: 'black', minHeight: 400, width: '100%' }} autoPlay />
        </Box>
    )
}