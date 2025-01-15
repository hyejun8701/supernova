import React, { useState, useMemo, useEffect } from 'react';
import { SafeAreaView, TextInput, Button, Text, View, TouchableOpacity, Alert, Modal, ActivityIndicator } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';

const App = () => {
  const [input, setInput] = useState('');
  const [results, setResults] = useState([]);
  const [savedSentences, setSavedSentences] = useState([]);
  const [quizVisible, setQuizVisible] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOptions, setQuizOptions] = useState([]);
  const [userAnswer, setUserAnswer] = useState([]);
  const [quizResult, setQuizResult] = useState('');
  const [scrapbookVisible, setScrapbookVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchSentences = async () => {
    if (!input) return Alert.alert('입력 필요', '단어를 입력해주세요.');

    const processedInput = input.trim().toLowerCase();

    setLoading(true);

    try {
      const encodedInput = encodeURIComponent(processedInput);
      const response = await axios.get(`https://supernova-server.netlify.app/.netlify/functions/fetchExamples?word=${encodedInput}`);
      const encodedExamples = response.data.examples;

      if (encodedExamples.length > 0) {
        const decodedExamples = encodedExamples.map(example => decodeURIComponent(example));
        setResults(decodedExamples);
      } else {
        Alert.alert('예문 없음', '해당 단어의 예문을 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('API 요청 오류:', error);
      Alert.alert('오류 발생', '데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const saveSentence = (sentence) => {
    if (savedSentences.includes(sentence)) {
      setSavedSentences(savedSentences.filter(savedSentence => savedSentence !== sentence));
    } else {
      setSavedSentences([...savedSentences, sentence]);
    }
  };

  const startQuiz = () => {
    if (results.length === 0) return Alert.alert('퀴즈 시작 불가', '먼저 단어를 검색하세요.');
    const sentence = results[Math.floor(Math.random() * results.length)];
    const words = sentence.split(' ').sort(() => Math.random() - 0.5);
    setQuizQuestion(sentence); // 정답 문장은 숨깁니다
    setQuizOptions(words);
    setUserAnswer([]);
    setQuizResult(''); // 퀴즈 시작 시 결과 초기화
    setQuizVisible(true);
  };

  const toggleWordSelection = (word, index) => {
    setUserAnswer(prevAnswer => {
      // 이미 선택된 단어와 인덱스가 있는지 확인
      const existingIndex = prevAnswer.findIndex(item => item.word === word && item.index === index);
  
      if (existingIndex !== -1) {
        // 이미 선택된 경우: 제거
        return prevAnswer.filter((_, i) => i !== existingIndex);
      }
  
      // 선택되지 않은 경우: 추가
      return [...prevAnswer, { word, index }];
    });
  };
  
  
  

  const checkQuizAnswer = () => {
    const correctAnswer = quizQuestion.split(' ').join(' ');
    const userAnswerString = userAnswer.map(item => item.word).join(' ');

    if (userAnswerString === correctAnswer) {
      setQuizResult('정답입니다! 잘했어요!');
    } else {
      setQuizResult('틀렸습니다. 다시 시도해보세요.');
    }
  };

  const restartQuiz = () => {
    setUserAnswer([]);
    setQuizResult('');
    setQuizVisible(true);
  };

  const nextQuiz = () => {
    if (results.length === 0) return Alert.alert('퀴즈 시작 불가', '먼저 단어를 검색하세요.');
    const sentence = results[Math.floor(Math.random() * results.length)];
    const words = sentence.split(' ').sort(() => Math.random() - 0.5);
    setQuizQuestion(sentence); // 정답 문장은 숨깁니다
    setQuizOptions(words);
    setUserAnswer([]);
    setQuizResult(''); // 퀴즈 시작 시 결과 초기화
    setQuizVisible(true);
  };

  const toggleScrapbook = () => {
    setScrapbookVisible(!scrapbookVisible);
  };

  const styles = useMemo(() => ({
    container: { flex: 1, padding: 20 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 50, height: 50 },
    input: { flex: 1, padding: 10, borderRadius: 5, paddingLeft: 10, height: 40 },
    searchButton: { position: 'absolute', right: 10, zIndex: 1 },
    sentenceContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, padding: 10, borderWidth: 1, borderRadius: 10 },
    sentenceText: { flex: 1, flexWrap: 'wrap', marginRight: 10 },
    grayText: { color: 'gray' },
    button: { marginTop: 20 },
    
    // 수정된 부분: quizContainer에 marginTop 추가하여 닫기 버튼과 겹치지 않도록 함
    quizContainer: { 
      flexDirection: 'row', 
      flexWrap: 'wrap', 
      justifyContent: 'center', 
      marginBottom: 20, 
      marginTop: 60, // 여백을 추가해 닫기 버튼과 겹치지 않게 함
    },
    
    wordOption: { padding: 10, borderWidth: 1, margin: 5, borderRadius: 5 },
    selectedWord: { backgroundColor: 'lightgreen' },
    quizResult: { marginTop: 20, fontWeight: 'bold', textAlign: 'center' },
    tabContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: 10 },
    tabText: { fontSize: 18 },
    recentSearchesContainer: { position: 'absolute', top: 105, left: 0, right: 0, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#ddd', zIndex: 10, maxHeight: 200, width: '100%' },
    recentSearchItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
    modalContainer: { flex: 1, padding: 20 },
    modalHeader: { marginBottom: 20 },
    wordOptionSelected: { backgroundColor: 'lightblue' },
    iconButton: { 
      padding: 10, 
      backgroundColor: '#007BFF', 
      borderRadius: 5, 
      margin: 5,
      width: 40, // 아이콘 크기에 맞는 너비 설정
      height: 40, // 아이콘 크기에 맞는 높이 설정
      justifyContent: 'center', 
      alignItems: 'center', // 아이콘을 중앙 정렬
    }
,    quizstartButton: {
  padding: 10, 
  backgroundColor: '#007BFF', 
  borderRadius: 5, 
  margin: 5,
  width: 100, // 아이콘 크기에 맞는 너비 설정
  height: 40, // 아이콘 크기에 맞는 높이 설정
  justifyContent: 'center', 
  alignItems: 'center', // 아이콘을 중앙 정렬
},

    icon: { color: 'white' },
    starButton: { marginLeft: 10 },
    iconSize: 20,  // 아이콘 크기 조정
    selectedWordDisplay: { marginTop: 20, padding: 10, borderWidth: 1, borderRadius: 5, backgroundColor: '#f0f0f0' },
  
    // 수정된 부분: closeButton을 헤더 우측 상단에 배치
    closeButton: { 
      position: 'absolute', 
      right: 10,  // 헤더의 우측에 위치
      top: 10,    // 헤더와 맞춰서 위치
      padding: 10, 
      backgroundColor: '#FF6347', 
      borderRadius: 5, 
    },
  
    quizButtons: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
    quizButton: { margin: 10, padding: 10, backgroundColor: '#007BFF', borderRadius: 5 },
  
    starFilled: { color: 'gold' }, // 별이 채워졌을 때 색상
    starOutline: { color: 'gray' }, // 비어있는 별 색상
    scrapbookContainer: { marginTop: 20, padding: 10, backgroundColor: '#f9f9f9', borderWidth: 1, borderRadius: 10 },
    scrapbookItem: { padding: 10, marginBottom: 5, borderBottomWidth: 1, borderBottomColor: '#ddd' },
    scrapbookButton: { 
      padding: 10, 
      backgroundColor: '#007BFF', 
      borderRadius: 5, 
      margin: 5,
      alignItems: 'center',
      justifyContent: 'center', 
    },
  
    modalBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    },
    modalContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 20,
    },
  }), []);
  
  

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="단어를 입력하세요"
          value={input}
          onChangeText={setInput}
          style={styles.input}
        />
        <TouchableOpacity style={styles.searchButton} onPress={fetchSentences}>
          <Icon name="search" size={styles.iconSize} color="gray" />
        </TouchableOpacity>
      </View>
  
      {/* 퀴즈 시작 버튼 아이콘 추가 */}
    <TouchableOpacity onPress={startQuiz} style={styles.iconButton}>
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Icon name="play" size={styles.iconSize} style={styles.icon} />
    {/* <Text style={{ marginLeft: 5 }}>퀴즈 시작</Text> */}
  </View>
</TouchableOpacity>

  
      {/* 스크랩북 버튼 */}
      <TouchableOpacity onPress={toggleScrapbook} style={styles.iconButton}>
  <Icon name="bookmarks" size={styles.iconSize} style={styles.icon} />
</TouchableOpacity>

  
      {/* 로딩 상태와 예문 출력 */}
      {loading ? (
        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <View>
          {results.map((sentence, index) => (
            <View key={index} style={styles.sentenceContainer}>
              <Text style={styles.sentenceText}>{sentence}</Text>
              <TouchableOpacity onPress={() => saveSentence(sentence)} style={styles.starButton}>
                <Icon name={savedSentences.includes(sentence) ? 'star' : 'star-outline'} size={styles.iconSize} style={savedSentences.includes(sentence) ? styles.starFilled : styles.starOutline} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
  
      {/* 스크랩북 모달 */}
      {scrapbookVisible && (
        <Modal visible={scrapbookVisible} transparent={false}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeaderContainer}>
              <Text style={styles.modalHeader}>스크랩북</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setScrapbookVisible(false)}
              >
                <Text style={{ color: 'white' }}>닫기</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.scrapbookContainer}>
              {savedSentences.length > 0 ? (
                savedSentences.map((sentence, index) => (
                  <View key={index} style={styles.scrapbookItem}>
                    <Text>{sentence}</Text>
                  </View>
                ))
              ) : (
                <Text>스크랩한 내용이 없습니다.</Text>
              )}
            </View>
          </SafeAreaView>
        </Modal>
      )}
  
      {/* 퀴즈 관련 */}
      {quizVisible && (
        <Modal visible={quizVisible} transparent={false}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeaderContainer}>
              <Text style={styles.modalHeader}>퀴즈</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setQuizVisible(false)}
              >
                <Text style={{ color: 'white' }}>닫기</Text>
              </TouchableOpacity>
            </View>
  
            <View style={styles.quizContainer}>
              {quizOptions.map((word, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.wordOption,
                    userAnswer.some(item => item.word === word && item.index === index) && styles.wordOptionSelected
                  ]}
                  onPress={() => toggleWordSelection(word, index)}
                >
                  <Text>{word}</Text>
                </TouchableOpacity>
              ))}
            </View>
  
            <View style={styles.selectedWordDisplay}>
              <Text>만든 문장:</Text>
              <Text>{userAnswer.map(item => item.word).join(' ')}</Text>
            </View>
  
            <View style={styles.quizButtons}>
              <TouchableOpacity style={styles.iconButton} onPress={checkQuizAnswer}>
                <Icon name="checkmark-circle" size={styles.iconSize} style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={restartQuiz}>
                <Icon name="refresh" size={styles.iconSize} style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={nextQuiz}>
                <Icon name="arrow-forward" size={styles.iconSize} style={styles.icon} />
              </TouchableOpacity>
            </View>
  
            <View style={styles.quizResult}>
              <Text>{quizResult}</Text>
            </View>
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
  
};

export default App;
