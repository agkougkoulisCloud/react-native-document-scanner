import React from 'react'
import {
  findNodeHandle,
  NativeEventEmitter,
  NativeModules,
  NativeSyntheticEvent,
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

export interface CameraResolution {
  width: number;
  height: number;
}

interface PdfScannerProps {
  onPictureTaken?: (event: NativeSyntheticEvent<PictureTaken>) => void;
  onRectangleDetect?: (event: NativeSyntheticEvent<any>) => void;
  onProcessing?: () => void;
  onDeviceSetup?: (event: NativeSyntheticEvent<CameraResolution>) => void;
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
  private eventEmitter = new NativeEventEmitter(ScannerManager);

  private onPictureTakenListener: any;
  private onProcessingListener: any;
  private onDeviceSetupListener: any;

  sendOnPictureTakenEvent (event: NativeSyntheticEvent<PictureTaken>) {
    if (this.props.onPictureTaken) {
      this.props.onPictureTaken(event)
    }
  }

  sendOnRectangleDetectEvent (event: NativeSyntheticEvent<any>) {
    if (this.props.onRectangleDetect) {
      this.props.onRectangleDetect(event)
    }
  }

  sendOnDeviceSetupEvent (event: NativeSyntheticEvent<CameraResolution>) {
    if (this.props.onDeviceSetup) {
      this.props.onDeviceSetup(event)
    }
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
        this.onPictureTakenListener = this.eventEmitter.addListener('onPictureTaken', this.sendOnPictureTakenEvent.bind(this))
      }
      if (onProcessing) {
        this.onProcessingListener = this.eventEmitter.addListener('onProcessingChange', onProcessing)
      }
      if (onDeviceSetup) {
        this.onDeviceSetupListener = this.eventEmitter.addListener('onDeviceSetup', this.sendOnDeviceSetupEvent.bind(this))
      }
    }
  }

  componentDidUpdate (prevProps: PdfScannerProps) {
    if (Platform.OS === 'android') {
      if (this.props.onPictureTaken !== prevProps.onPictureTaken) {
        if (prevProps.onPictureTaken) {
          this.onPictureTakenListener && this.onPictureTakenListener.remove()
        }
        if (this.props.onPictureTaken) {
          this.onPictureTakenListener = this.eventEmitter.addListener('onPictureTaken', this.sendOnPictureTakenEvent.bind(this))
        }
      }
      if (this.props.onProcessing !== prevProps.onProcessing) {
        if (prevProps.onProcessing) {
          this.onProcessingListener && this.onProcessingListener.remove()
        }
        if (this.props.onProcessing) {
          this.onProcessingListener = this.eventEmitter.addListener('onProcessingChange', this.props.onProcessing)
        }
      }
      if (this.props.onDeviceSetup !== prevProps.onDeviceSetup) {
        if (prevProps.onDeviceSetup) {
          this.onDeviceSetupListener && this.onDeviceSetupListener.remove()
        }
        if (this.props.onDeviceSetup) {
          this.onDeviceSetupListener = this.eventEmitter.addListener('onDeviceSetup', this.sendOnDeviceSetupEvent.bind(this))
        }
      }
    }
  }

  componentWillUnmount () {
    if (Platform.OS === 'android') {
      const { onPictureTaken, onProcessing, onDeviceSetup } = this.props
      if (onPictureTaken) this.onPictureTakenListener && this.onPictureTakenListener.remove()
      if (onProcessing) this.onProcessingListener && this.onProcessingListener.remove()
      if (onDeviceSetup) this.onDeviceSetupListener && this.onDeviceSetupListener.remove()
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
