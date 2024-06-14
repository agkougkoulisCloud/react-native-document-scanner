/* eslint-disable complexity */
import React from 'react'
import {
  DeviceEventEmitter,
  EmitterSubscription,
  findNodeHandle,
  NativeModules,
  Platform,
  requireNativeComponent,
  ViewStyle
} from 'react-native'

const RNPdfScanner = requireNativeComponent('RNPdfScanner')
const ScannerManager: any = NativeModules.RNPdfScannerManager

export interface PictureTaken {
  rectangleCoordinates?: object;
  croppedImage: string;
  initialImage: string;
  width: number;
  height: number;
}

/**
 * TODO: Change to something like this
interface PictureTaken {
  uri: string;
  base64?: string;
  width?: number; // modify to get it
  height?: number; // modify to get it
  rectangleCoordinates?: object;
  initial: {
    uri: string;
    base64?: string;
    width: number; // modify to get it
    height: number; // modify to get it
  };
}
 */

interface PdfScannerProps {
  onPictureTaken?: (event: any) => void;
  onRectangleDetect?: (event: any) => void;
  onDeviceSetup?: (event: any) => void;
  onProcessing?: () => void;
  quality?: number;
  overlayColor?: number | string;
  enableTorch?: boolean;
  useFrontCam?: boolean;
  saturation?: number;
  brightness?: number;
  contrast?: number;
  detectionCountBeforeCapture?: number;
  durationBetweenCaptures?: number;
  detectionRefreshRateInMS?: number;
  documentAnimation?: boolean;
  noGrayScale?: boolean;
  manualOnly?: boolean;
  style?: ViewStyle;
  useBase64?: boolean;
  saveInAppDocument?: boolean;
  captureMultiple?: boolean;
}

class PdfScanner extends React.Component<PdfScannerProps> {
  private onPictureTaken: EmitterSubscription | undefined;
  private onProcessingChange: EmitterSubscription | undefined;
  private onDeviceSetup: EmitterSubscription | undefined;

  sendOnPictureTakenEvent (event: any) {
    if (!this.props.onPictureTaken) return null
    return this.props.onPictureTaken(event.nativeEvent)
  }

  sendOnRectangleDetectEvent (event: any) {
    if (!this.props.onRectangleDetect) return null
    return this.props.onRectangleDetect(event.nativeEvent)
  }

  sendOnDeviceSetupEvent (event: any) {
    if (!this.props.onDeviceSetup) return null
    return this.props.onDeviceSetup(event.nativeEvent)
  }

  getImageQuality () {
    if (!this.props.quality) return 0.8
    if (this.props.quality > 1) return 1
    if (this.props.quality < 0.1) return 0.1
    return this.props.quality
  }

  componentDidMount () {
    if (Platform.OS === 'android') {
      const { onPictureTaken, onProcessing, onDeviceSetup } = this.props
      if (onPictureTaken) {
        this.onPictureTaken = DeviceEventEmitter.addListener('onPictureTaken', onPictureTaken)
      }
      if (onProcessing) {
        this.onProcessingChange = DeviceEventEmitter.addListener(
          'onProcessingChange',
          onProcessing
        )
      }
      if (onDeviceSetup) {
        this.onDeviceSetup = DeviceEventEmitter.addListener('onDeviceSetup', onDeviceSetup)
      }
    }
  }

  componentDidUpdate (prevProps: PdfScannerProps) {
    if (Platform.OS === 'android') {
      if (this.props.onPictureTaken !== prevProps.onPictureTaken) {
        if (prevProps.onPictureTaken) {
          this.onPictureTaken && this.onPictureTaken.remove()
        }
        if (this.props.onPictureTaken) {
          this.onPictureTaken = DeviceEventEmitter.addListener(
            'onPictureTaken',
            this.props.onPictureTaken
          )
        }
      }
      if (this.props.onProcessing !== prevProps.onProcessing) {
        if (prevProps.onProcessing) {
          this.onProcessingChange && this.onProcessingChange.remove()
        }
        if (this.props.onProcessing) {
          this.onProcessingChange = DeviceEventEmitter.addListener(
            'onProcessingChange',
            this.props.onProcessing
          )
        }
      }
      if (this.props.onDeviceSetup !== prevProps.onDeviceSetup) {
        if (prevProps.onDeviceSetup) {
          this.onDeviceSetup && this.onDeviceSetup.remove()
        }
        if (this.props.onDeviceSetup) {
          this.onDeviceSetup = DeviceEventEmitter.addListener(
            'onDeviceSetup',
            this.props.onDeviceSetup
          )
        }
      }
    }
  }

  componentWillUnmount () {
    if (Platform.OS === 'android') {
      const { onPictureTaken, onProcessing, onDeviceSetup } = this.props
      if (onPictureTaken) this.onPictureTaken && this.onPictureTaken.remove() // DeviceEventEmitter.removeListener("onPictureTaken", onPictureTaken)
      if (onProcessing) this.onProcessingChange && this.onProcessingChange.remove() // DeviceEventEmitter.removeListener("onProcessingChange", onProcessing)
      if (onDeviceSetup) this.onDeviceSetup && this.onDeviceSetup.remove()
    }
  }

  capture () {
    if (this._scannerHandle) {
      ScannerManager.capture(this._scannerHandle)
    }
  }

  _scannerRef: any = null;
  _scannerHandle: number | null = null;
  _setReference = (ref: any) => {
    if (ref) {
      this._scannerRef = ref
      this._scannerHandle = findNodeHandle(ref)
    } else {
      this._scannerRef = null
      this._scannerHandle = null
    }
  };

  render () {
    return (
      <RNPdfScanner
        ref={this._setReference}
        {...this.props}
        onPictureTaken={this.sendOnPictureTakenEvent.bind(this)}
        onRectangleDetect={this.sendOnRectangleDetectEvent.bind(this)}
        onDeviceSetup={this.sendOnDeviceSetupEvent.bind(this)}
        useFrontCam={this.props.useFrontCam || false}
        brightness={this.props.brightness || 0}
        saturation={this.props.saturation || 1}
        contrast={this.props.contrast || 1}
        quality={this.getImageQuality()}
        detectionCountBeforeCapture={this.props.detectionCountBeforeCapture || 5}
        durationBetweenCaptures={this.props.durationBetweenCaptures || 0}
        detectionRefreshRateInMS={this.props.detectionRefreshRateInMS || 50}
      />
    )
  }
}

export default PdfScanner
