import type {AdapterTypes as ZHAdapterTypes, Events as ZHEvents, Models as ZHModels} from 'zigbee-herdsman';
import type {Cluster as ZHCluster, FrameControl as ZHFrameControl} from 'zigbee-herdsman/dist/zspec/zcl/definition/tstype';

import type TypeEventBus from '../eventBus';
import type TypeExtension from '../extension/extension';
import type TypeDevice from '../model/device';
import type TypeGroup from '../model/group';
import type TypeMQTT from '../mqtt';
import type TypeState from '../state';
import type TypeZigbee from '../zigbee';

import {LogLevel} from '../util/settings';

type OptionalProps<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

declare global {
    // Define some class types as global
    type EventBus = TypeEventBus;
    type MQTT = TypeMQTT;
    type Zigbee = TypeZigbee;
    type Group = TypeGroup;
    type Device = TypeDevice;
    type State = TypeState;
    type Extension = TypeExtension;

    // Types
    type StateChangeReason = 'publishDebounce' | 'groupOptimistic' | 'lastSeenChanged' | 'publishCached' | 'publishThrottle';
    type PublishEntityState = (entity: Device | Group, payload: KeyValue, stateChangeReason?: StateChangeReason) => Promise<void>;
    type RecursivePartial<T> = {[P in keyof T]?: RecursivePartial<T[P]>};
    interface KeyValue {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [s: string]: any;
    }

    // zigbee-herdsman
    namespace zh {
        type Endpoint = ZHModels.Endpoint;
        type Device = ZHModels.Device;
        type Group = ZHModels.Group;
        type LQI = ZHAdapterTypes.LQI;
        type RoutingTable = ZHAdapterTypes.RoutingTable;
        type CoordinatorVersion = ZHAdapterTypes.CoordinatorVersion;
        type NetworkParameters = ZHAdapterTypes.NetworkParameters;
        interface Bind {
            cluster: ZHCluster;
            target: zh.Endpoint | zh.Group;
        }
    }

    namespace eventdata {
        type EntityRenamed = {entity: Device | Group; homeAssisantRename: boolean; from: string; to: string};
        type EntityRemoved = {id: number | string; name: string; type: 'device' | 'group'};
        type MQTTMessage = {topic: string; message: string};
        type MQTTMessagePublished = {topic: string; payload: string; options: {retain: boolean; qos: number}};
        type StateChange = {
            entity: Device | Group;
            from: KeyValue;
            to: KeyValue;
            reason?: string;
            update: KeyValue;
        };
        type PermitJoinChanged = ZHEvents.PermitJoinChangedPayload;
        type LastSeenChanged = {
            device: Device;
            reason: 'deviceAnnounce' | 'networkAddress' | 'deviceJoined' | 'messageEmitted' | 'messageNonEmitted';
        };
        type DeviceNetworkAddressChanged = {device: Device};
        type DeviceAnnounce = {device: Device};
        type DeviceInterview = {device: Device; status: 'started' | 'successful' | 'failed'};
        type DeviceJoined = {device: Device};
        type EntityOptionsChanged = {entity: Device | Group; from: KeyValue; to: KeyValue};
        type ExposesChanged = {device: Device};
        type Reconfigure = {device: Device};
        type DeviceLeave = {ieeeAddr: string; name: string};
        type GroupMembersChanged = {group: Group; action: 'remove' | 'add' | 'remove_all'; endpoint: zh.Endpoint; skipDisableReporting: boolean};
        type PublishEntityState = {entity: Group | Device; message: KeyValue; stateChangeReason?: StateChangeReason; payload: KeyValue};
        type DeviceMessage = {
            type: ZHEvents.MessagePayloadType;
            device: Device;
            endpoint: zh.Endpoint;
            linkquality: number;
            groupID: number;
            cluster: string | number;
            data: KeyValue | Array<string | number>;
            meta: {zclTransactionSequenceNumber?: number; manufacturerCode?: number; frameControl?: ZHFrameControl};
        };
        type ScenesChanged = {entity: Device | Group};
    }

    // Settings
    interface Settings {
        version?: number;
        homeassistant: {
            enabled: boolean;
            discovery_topic: string;
            status_topic: string;
            experimental_event_entities: boolean;
            legacy_action_sensor: boolean;
        };
        availability: {
            enabled: boolean;
            active: {timeout: number};
            passive: {timeout: number};
        };
        mqtt: {
            base_topic: string;
            include_device_information: boolean;
            force_disable_retain: boolean;
            version?: 3 | 4 | 5;
            user?: string;
            password?: string;
            server: string;
            ca?: string;
            keepalive?: number;
            key?: string;
            cert?: string;
            client_id?: string;
            reject_unauthorized?: boolean;
            maximum_packet_size: number;
        };
        serial: {
            disable_led: boolean;
            port?: string;
            adapter?: 'deconz' | 'zstack' | 'ezsp' | 'zigate' | 'ember' | 'zboss' | 'zoh';
            baudrate?: number;
            rtscts?: boolean;
        };
        passlist: string[];
        blocklist: string[];
        map_options: {
            graphviz: {
                colors: {
                    fill: {
                        enddevice: string;
                        coordinator: string;
                        router: string;
                    };
                    font: {
                        coordinator: string;
                        router: string;
                        enddevice: string;
                    };
                    line: {
                        active: string;
                        inactive: string;
                    };
                };
            };
        };
        ota: {
            update_check_interval: number;
            disable_automatic_update_check: boolean;
            zigbee_ota_override_index_location?: string;
            image_block_response_delay?: number;
            default_maximum_data_size?: number;
        };
        frontend: {
            enabled: boolean;
            auth_token?: string;
            host?: string;
            port: number;
            base_url: string;
            url?: string;
            ssl_cert?: string;
            ssl_key?: string;
            notification_filter?: string[];
        };
        devices: {[s: string]: DeviceOptions};
        groups: {[s: string]: Omit<GroupOptions, 'ID'>};
        device_options: KeyValue;
        advanced: {
            log_rotation: boolean;
            log_console_json: boolean;
            log_symlink_current: boolean;
            log_output: ('console' | 'file' | 'syslog')[];
            log_directory: string;
            log_file: string;
            log_level: LogLevel;
            log_namespaced_levels: Record<string, LogLevel>;
            log_syslog: KeyValue;
            log_debug_to_mqtt_frontend: boolean;
            log_debug_namespace_ignore: string;
            log_directories_to_keep: number;
            pan_id: number | 'GENERATE';
            ext_pan_id: number[] | 'GENERATE';
            channel: number;
            adapter_concurrent?: number;
            adapter_delay?: number;
            cache_state: boolean;
            cache_state_persistent: boolean;
            cache_state_send_on_startup: boolean;
            last_seen: 'disable' | 'ISO_8601' | 'ISO_8601_local' | 'epoch';
            elapsed: boolean;
            network_key: number[] | 'GENERATE';
            timestamp_format: string;
            output: 'json' | 'attribute' | 'attribute_and_json';
            transmit_power?: number;
        };
    }

    interface DeviceOptions {
        disabled?: boolean;
        retention?: number;
        availability?: boolean | {timeout: number};
        optimistic?: boolean;
        debounce?: number;
        debounce_ignore?: string[];
        throttle?: number;
        filtered_attributes?: string[];
        filtered_cache?: string[];
        filtered_optimistic?: string[];
        icon?: string;
        homeassistant?: KeyValue;
        friendly_name: string;
        description?: string;
        qos?: 0 | 1 | 2;
    }

    interface DeviceOptionsWithId extends DeviceOptions {
        ID: string;
    }

    interface GroupOptions {
        ID: number;
        optimistic?: boolean;
        off_state?: 'all_members_off' | 'last_member_state';
        filtered_attributes?: string[];
        filtered_cache?: string[];
        filtered_optimistic?: string[];
        homeassistant?: KeyValue;
        friendly_name: string;
        description?: string;
        qos?: 0 | 1 | 2;
    }
}
