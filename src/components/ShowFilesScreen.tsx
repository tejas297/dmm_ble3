import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView,Alert,Share, TouchableOpacity, Modal, Platform, ActionSheetIOS } from 'react-native';
import RNFS from 'react-native-fs';
import { shareFileWithSystem } from './ShareFileUtil';
import { Text, Button, Provider as PaperProvider } from 'react-native-paper';
import { lightTheme } from '../theme'; // adjust path if needed

const parseCsv = (csv: string): string[][] => {
  return csv
    .split(/\r?\n/)
    .filter(Boolean)
    .map(line => line.split(','));
};

const ShowFilesScreen = () => {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [csvFileName, setCsvFileName] = useState('');
  const [actionFile, setActionFile] = useState<string | null>(null);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);

  const deleteFile = async (fileName: string) => {
    try {
      const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      await RNFS.unlink(path);
      Alert.alert(`${fileName} deleted.`);
      loadFiles();
    } catch (err) {
      Alert.alert('Failed to delete file: ' + (err as Error).message);
    }
  };

  const openInFileSystem = async (fileName: string) => {
    try {
      const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      await shareFileWithSystem(path, fileName);
    } catch (err) {
      Alert.alert('Failed to open in file system: ' + (err as Error).message);
    }
  };

  const showFileActions = (fileName: string) => {
    setActionFile(fileName);
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Share', 'Delete', 'Open in File System'],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) shareFile(fileName);
          else if (buttonIndex === 2) deleteFile(fileName);
          else if (buttonIndex === 3) openInFileSystem(fileName);
        }
      );
    } else {
      setActionSheetVisible(true);
    }
  };

  const loadFiles = async () => {
    setLoading(true);
    try {
      const result = await RNFS.readDir(RNFS.DocumentDirectoryPath);
      const fileNames = result.filter(f => f.isFile()).map(f => f.name);
      setFiles(fileNames);
    } catch (err) {
      Alert.alert('Failed to list files: ' + (err as Error).message);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const openFile = async (fileName: string) => {
    try {
      const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      const content = await RNFS.readFile(path, 'utf8');
      if (fileName.endsWith('.csv')) {
        setCsvRows(parseCsv(content));
        setCsvFileName(fileName);
        setModalVisible(true);
      } else {
        Alert.alert(`${fileName}:\n\n${content || '(Empty file)'}`);
      }
    } catch (err) {
      Alert.alert('Failed to open file: ' + (err as Error).message);
    }
  };

  const shareFile = async (fileName: string) => {
    try {
      const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      await Share.share({
        url: Platform.OS === 'android' ? 'file://' + path : path,
        title: fileName,
        message: 'Open this CSV file with a compatible app.',
      });
    } catch (err) {
      Alert.alert('Failed to share file: ' + (err as Error).message);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  return (
    <PaperProvider theme={lightTheme}>
      <View style={{ flex: 1 }}>
        <ScrollView style={styles.body} contentContainerStyle={styles.contentContainer}>
          <Text variant="titleLarge" style={styles.header}>Files in App Storage</Text>
            <Button mode="contained" onPress={loadFiles}>Refresh</Button>
            <View style={{ marginTop: 20 }}/>
          {loading ? (
            <Text style={styles.loading}>Loading...</Text>
          ) : files.length === 0 ? (
            <Text style={styles.noFiles}>No files found.</Text>
          ) : (
            <>
              {files.map((file, idx) => (
                <View key={idx} style={styles.fileRow}>
                  <TouchableOpacity style={{ flex: 1 }} onPress={() => openFile(file)}>
                    <Text selectable style={styles.fileText}>{file}</Text>
                    {file.endsWith('.csv') && (
                      <Text style={{ fontSize: 11, color: lightTheme.colors.primary, marginTop: 2 }}>
                        (Long press to open in another app)
                      </Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.moreIcon} onPress={() => showFileActions(file)}>
                    <Text style={styles.moreIconText}>⋮</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}
        </ScrollView>

        {/* CSV Preview Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{csvFileName}</Text>
              <ScrollView horizontal style={{ marginBottom: 10 }}>
                <View>
                  {csvRows.map((row, i) => (
                    <View key={i} style={styles.csvRow}>
                      {row.map((cell, j) => (
                        <Text
                          key={j}
                          style={[styles.csvCell]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {cell}
                        </Text>
                      ))}
                    </View>
                  ))}
                </View>
              </ScrollView>
              <Button mode="contained" onPress={() => setModalVisible(false)}>
                Close
              </Button>
            </View>
          </View>
        </Modal>

        {/* Android Action Sheet Modal */}
        {Platform.OS === 'android' && actionSheetVisible && (
          <Modal
            visible={actionSheetVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setActionSheetVisible(false)}
          >
            <TouchableOpacity style={styles.actionSheetOverlay} onPress={() => setActionSheetVisible(false)}>
              <View style={styles.actionSheet}>
                <Button onPress={() => { actionFile && shareFile(actionFile); setActionSheetVisible(false); }}>Open</Button>
                <Button textColor="red" onPress={() => { actionFile && deleteFile(actionFile); setActionSheetVisible(false); }}>Delete</Button>
                <Button onPress={() => { actionFile && openInFileSystem(actionFile); setActionSheetVisible(false); }}>Share</Button>
                <Button onPress={() => setActionSheetVisible(false)}>Cancel</Button>
              </View>
            </TouchableOpacity>
          </Modal>
        )}
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  contentContainer: {
    padding: 18,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: lightTheme.colors.primary,
    textAlign: 'center',
  },
  loading: {
    marginTop: 20,
    textAlign: 'center',
    color: lightTheme.colors.placeholder,
  },
  noFiles: {
    marginTop: 20,
    textAlign: 'center',
    color: lightTheme.colors.placeholder,
  },
  fileRow: {
    marginBottom: 8,
    backgroundColor: lightTheme.colors.surface,
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
    flexDirection: 'row',
  },
  fileText: {
    fontSize: 15,
    color: lightTheme.colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: lightTheme.colors.surface,
    borderRadius: 10,
    padding: 18,
    minWidth: 280,
    maxWidth: '90%',
    maxHeight: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    color: lightTheme.colors.primary,
  },
  csvRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  csvCell: {
    minWidth: 60,
    maxWidth: 120,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
    fontSize: 14,
    color: lightTheme.colors.text,
    textAlign: 'center',
  },
  csvHeaderCell: {
    fontWeight: 'bold',
    backgroundColor: '#e3f0fc',
  },
  moreIcon: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreIconText: {
    fontSize: 22,
    color: lightTheme.colors.primary,
    fontWeight: 'bold',
    marginLeft: 2,
    marginRight: 2,
  },
  actionSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
  },
  actionSheet: {
    backgroundColor: lightTheme.colors.surface,
    padding: 10,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    elevation: 6,
  },
});

export default ShowFilesScreen;
