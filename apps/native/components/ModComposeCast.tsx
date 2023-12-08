// import { fetchUrlMetadata } from "@mod-protocol/core";
// import { getFarcasterMentions } from "@mod-protocol/farcaster";
// import { useEditor, EditorContent } from "@mod-protocol/react-editor";
// import { EmbedsEditor } from "@mod-protocol/react-ui-shadcn/dist/lib/embeds";
// import React, { useState, useCallback } from 'react';
// import { View, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';

// import CastIcon from '../assets/images/castIcon.png';
// import { useLogin } from '../providers/NeynarProvider';

// const API_URL = 'http://api.modprotocol.org';

// const ModComposeCast = ({ hash }: { hash?: string }) => {
//   const [text, setText] = useState('');
//   const { farcasterUser } = useLogin();
//   const getUrlMetadata = fetchUrlMetadata(API_URL);
//  const getResults = getFarcasterMentions(API_URL);
//   // const getChannels = getFarcasterChannels(API_URL);

//   const { editor, getEmbeds, setEmbeds, getText, setChannel, getChannel } = useEditor({
//     fetchUrlMetadata: getUrlMetadata,
//     linkClassName: "text-blue-600",
//     onError: error => console.error(error),
//     onSubmit: cast => console.log(cast),
//     renderMentionsSuggestionConfig: {
//       getResults: getResults,
//     }
//   });

//   const handleCast = useCallback(async () => {
//     if (farcasterUser) {
//       try {
//         const response = await fetch(`${API_URL}/neynar/cast`, {
//           body: JSON.stringify({
//             parent: hash ? hash : '',
//             signer_uuid: farcasterUser.signer_uuid,
//             text: text,
//           }),
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           method: 'POST',
//         });

//         const result = await response.json();
//         if (response.ok) {
//           setText('');
//           setTimeout(() => setText('cast posted!'), 1500);
//           console.log('cast sent:', result);
//         } else {
//           throw new Error(result.message);
//         }
//       } catch (error) {
//         console.error('Could not send the cast', error);
//       }
//     }
//   }, [text, farcasterUser]);

//   return (
//     <View style={styles.composeContainer}>
//       {/* <View style={styles.composeInputContainer}>
//         <TextInput
//           value={text}
//           onChangeText={setText}
//           placeholder="cast something..."
//           style={styles.composeInput}
//         />
//         <TouchableOpacity onPress={handleCast} style={styles.composeButton}>
//           <Image source={CastIcon} style={styles.icon} />
//         </TouchableOpacity>
//       </View> */}
//       {/* <EditorContent editor={editor} autoFocus className="w-full h-full min-h-[200px]" /> */}
//       {/* <EmbedsEditor embeds={getEmbeds()} setEmbeds={setEmbeds} />  */}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   composeButton: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 8,
//     paddingRight: 0,
//   },
//   composeContainer: {
//     backgroundColor: 'white',
//     borderTopColor: '#EAEAEA',
//     borderTopWidth: 1,
//     bottom: 0,
//     left: 0,
//     padding: 10,
//     position: 'absolute',
//     right: 0,
//   },
//   composeInput: {
//     flex: 1,
//     paddingVertical: 10,
//   },
//   composeInputContainer: {
//     alignItems: 'center',
//     backgroundColor: '#F2F2F2',
//     borderRadius: 20,
//     flexDirection: 'row',
//     marginBottom: 15,
//     marginLeft: 10,
//     marginRight: 10,
//     paddingHorizontal: 15,
//   },
//   icon: {
//     height: 24,
//     resizeMode: 'contain',
//     width: 24,
//   },
// });

// export default ModComposeCast;