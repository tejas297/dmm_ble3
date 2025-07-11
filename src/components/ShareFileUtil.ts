// Utility to share a file using react-native-share (content URI, works for file managers)
// Requires: npm install react-native-share
import Share from 'react-native-share';
import { Platform } from 'react-native';

export async function shareFileWithSystem(path: string, fileName: string) {
  try {
    const url = Platform.OS === 'android' ? 'file://' + path : path;
    await Share.open({
      url,
      title: fileName,
      showAppsToView: true,
      failOnCancel: false,
    });
  } catch (err) {
    throw err;
  }
}
