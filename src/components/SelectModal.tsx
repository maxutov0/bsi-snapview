import { Box, Button, Card, Group, Image, SimpleGrid, Tabs, Text } from "@mantine/core";
import { closeAllModals } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { useContext } from "react";
import { SocketContext } from "../contexts/ws";
import { IScreen, IWindow } from "../types";

interface SelectModalProps {
    activeTab: string;
    screens?: IScreen[];
    windows?: IWindow[];
}

export default function SelectModal({ activeTab, screens, windows }: SelectModalProps): JSX.Element {
    const socket = useContext(SocketContext);

    const selectScreen = (id: string) => {
        socket.emit("selectScreen", id, () => {
            showNotification({
                title: 'Screen selected',
                message: `Screen #${id} selected`,
                color: 'green'
            });
        })

        closeAllModals();
    }

    const selectWindow = (id: string) => {
        socket.emit("selectWindow", id, () => {
            showNotification({
                title: 'Window selected',
                message: `Window #${id} selected`,
                color: 'green'
            });
        })

        closeAllModals();
    }

    return (
        <Box>
            <Tabs defaultValue={activeTab}>
                <Tabs.List>
                    <Tabs.Tab value="screen" >Screens</Tabs.Tab>
                    <Tabs.Tab value="window" >Windows</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="screen" pt="xs">
                    <SimpleGrid cols={2}>
                        {
                            screens?.map((screen) =>
                                <Card key={screen.id} shadow="sm" p="lg" radius="md" withBorder>
                                    <Card.Section>
                                        <Image
                                            src="https://images.unsplash.com/photo-1527004013197-933c4bb611b3?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=720&q=80"
                                            height={80}
                                            alt="Norway"
                                        />
                                    </Card.Section>

                                    <Group position="apart" mt="md" mb="xs">
                                        <Text weight={500}>#{screen.id}. {screen.title}</Text>
                                    </Group>

                                    <Button onClick={() => selectScreen(screen.id)} variant="light" color="blue" fullWidth mt="md" radius="md">
                                        Select
                                    </Button>
                                </Card>
                            )
                        }
                    </SimpleGrid>
                </Tabs.Panel>

                <Tabs.Panel value="window" pt="xs">
                    <SimpleGrid cols={2}>
                        {
                            windows?.map((window) =>
                                <Card key={window.id} shadow="sm" p="lg" radius="md" withBorder>
                                    <Card.Section>
                                        <Image
                                            src="https://images.unsplash.com/photo-1527004013197-933c4bb611b3?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=720&q=80"
                                            height={80}
                                            alt="Norway"
                                        />
                                    </Card.Section>

                                    <Group position="apart" mt="md" mb="xs">
                                        <Text weight={500}>#{window.id}. {window.title}</Text>
                                    </Group>

                                    <Button onClick={() => selectWindow(window.id)} variant="light" color="blue" fullWidth mt="md" radius="md">
                                        Select
                                    </Button>
                                </Card>
                            )
                        }
                    </SimpleGrid>
                </Tabs.Panel>
            </Tabs>
        </Box>
    )
}