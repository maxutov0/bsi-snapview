import { Alert, Container, LoadingOverlay } from "@mantine/core";
import { useContext, useEffect, useState } from "react";
import ScreenSharingControls from "./components/ScreenSharingControls";
import StreamCanvas from "./components/StreamCanvas";
import { SocketContext } from "./contexts/ws";
import { IRole, ITechnology } from "./types";

export default function App(): JSX.Element {
  const socket = useContext(SocketContext);
  const [role, setRole] = useState<string>();
  const [technologies, setTechnologies] = useState<ITechnology[]>();
  const [stream, setStream] = useState<MediaStream>();
  const [title, setTitle] = useState<string>('');
  const [transmissionMode, setTransmissionMode] = useState<ITechnology>();
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  useEffect(() => {
    // first bit
    socket.on("role", ({ role }) => {
      setRole(role);
    });

    // second bit
    socket.on("technologies", ({ technologies }) => {
      setTechnologies(technologies);
    });

    socket.on("streamStart", ({ title, content, isMobile }) => {
      setIsStreaming(true);
      setTitle(title)
      setStream(content);
      setIsMobile(isMobile);
    });

    socket.on("streamStop", () => {
      setIsStreaming(false);
      setStream(undefined);
      setIsMobile(false);
      setTitle('');
    })

    return () => {
      socket.off("role");
      socket.off("technologies");
      socket.off("streamStart");
      socket.off("streamStop");
    }
  }, [socket]);

  if (!socket.connected) {
    return <div style={{ minHeight: '100vh', position: 'relative' }}>
      <LoadingOverlay visible />
    </div>
  }

  return (
    <Container>
      <h1 style={{ textAlign: 'center' }}>BSI.Snapview</h1>

      {role === IRole.Presenter && (
        <>
          <Alert mb="md" title="You are presenter!" color="teal" withCloseButton variant="filled">
            You can share your screen with the audience. Press Start to begin.
          </Alert>
          <ScreenSharingControls
            technologies={technologies}
            isMobile={isMobile}
            setIsMobile={setIsMobile}
            transmissionMode={transmissionMode}
            setTransmissionMode={setTransmissionMode}
            stream={stream}
            setStream={setStream}
            isStreaming={isStreaming}
            setIsStreaming={setIsStreaming}
          />
        </>
      )}

      {
        role === IRole.Participant && (
          <Alert mb="md" title="You are participant!" color="grape" withCloseButton variant="filled">
            Stream will start soon.
          </Alert>
        )
      }

      {isStreaming && <StreamCanvas title={isMobile ? 'Mobile Display' : title} stream={stream} />}

    </Container>
  );
}
