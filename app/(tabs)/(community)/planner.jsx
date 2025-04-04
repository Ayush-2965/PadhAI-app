import React, { useState, useRef, useCallback, memo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import DateTimeSelector from "../../../components/DateTimeSelector";
import CustomTimePicker from "../../../components/VerticalTimePicker";
import { router } from "expo-router";
import Modal from "react-native-modal";
import { MaterialIcons } from '@expo/vector-icons';
import TranslatedText from "../../../components/translated";
import withTranslation from "../../../components/withTranslation";
import useAppTranslation from "../../../utils/useAppTranslation";

const { width } = Dimensions.get("window");

const Planner = ({ navigation, translation }) => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [subjects, setSubjects] = useState([]);
  const [timeSlots, setTimeSlots] = useState([
    {
      from: { hour: 10, minute: 0 },
      to: { hour: 11, minute: 0 },
    },
  ]);
  const { translate } = useAppTranslation();

  const getItemLayout = useCallback((data, index) => ({
    length: width,
    offset: width * index,
    index,
  }), [width]);

  const handleTimeChange = useCallback((index, type) => {
    return (value, timeType) => {
      setTimeSlots(prevSlots => {
        const newSlots = [...prevSlots];
        newSlots[index][type] = { ...newSlots[index][type], [timeType]: value };
        
        // Validate after update
        const newSlot = newSlots[index];
        const newStart = newSlot.from.hour * 60 + newSlot.from.minute;
        const newEnd = newSlot.to.hour * 60 + newSlot.to.minute;
        
        if (newEnd <= newStart) {
          translate("Invalid Time").then(title => 
            translate("End time must be after start time").then(message => 
              Alert.alert(title, message)
            )
          );
        } else if ((newEnd - newStart) < 60) {
          translate("Invalid Duration").then(title => 
            translate("Minimum slot duration is 1 hour").then(message => 
              Alert.alert(title, message)
            )
          );
        } else if ((newEnd - newStart) > 180) {
          translate("Invalid Duration").then(title => 
            translate("Maximum slot duration is 3 hours").then(message => 
              Alert.alert(title, message)
            )
          );
        }
        
        return newSlots;
      });
    };
  }, [translate]);

  const validateTimeSlot = useCallback((newSlot) => {
    const newStart = newSlot.from.hour * 60 + newSlot.from.minute;
    const newEnd = newSlot.to.hour * 60 + newSlot.to.minute;

    if (newEnd <= newStart) return false;
    if ((newEnd - newStart) < 60) return false;
    if ((newEnd - newStart) > 180) return false;

    return timeSlots.every((slot) => {
      const slotStart = slot.from.hour * 60 + slot.from.minute;
      const slotEnd = slot.to.hour * 60 + slot.to.minute;
      return (newEnd <= slotStart) || (newStart >= slotEnd);
    });
  }, [timeSlots]);

  const addTimeSlot = useCallback(() => {
    if (timeSlots.length >= 5) {
      translate("Limit Reached").then(title => 
        translate("Maximum 5 time slots allowed").then(message => 
          Alert.alert(title, message)
        )
      );
      return;
    }

    const newSlot = {
      from: { hour: 12, minute: 0 },
      to: { hour: 14, minute: 0 }
    };

    if (!validateTimeSlot(newSlot)) {
      translate("Invalid Slot").then(title => 
        translate("This slot overlaps with existing slots").then(message => 
          Alert.alert(title, message)
        )
      );
      return;
    }

    setTimeSlots(prev => [...prev, newSlot]);
  }, [timeSlots, validateTimeSlot, translate]);

  const deleteTimeSlot = useCallback((index) => {
    if (timeSlots.length <= 1) {
      translate("Cannot Delete").then(title => 
        translate("At least one time slot is required").then(message => 
          Alert.alert(title, message)
        )
      );
      return;
    }
    setTimeSlots(prev => prev.filter((_, i) => i !== index));
  }, [timeSlots.length, translate]);

  // DateAndTimeSlide Component
  const DateAndTimeSlide = memo(() => {
    return (
      <ScrollView className="flex-1 w-screen" nestedScrollEnabled={true}>
        <View className="p-5 bg-pink-50 flex-1">
          <TranslatedText 
            text="Craft Your Ideal Study Plan" 
            className="text-2xl mb-4 text-[#BD835D] font-bold"
          />
          <TranslatedText 
            text="Choose your deadline:" 
            className="text-xl font-bold mb-2 ml-2 text-[#bd835dc1]"
          />

          <View className="flex-row gap-2 mb-6 ml-2 mt-2">
            <View className="flex-1">
              <TranslatedText 
                text="From" 
                className="mb-2 text-[#BD835D] font-bold"
              />
              <DateTimeSelector
                mode="date"
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
            </View>
            <View className="flex-1">
              <TranslatedText 
                text="To" 
                className="mb-2 text-[#BD835D] font-bold"
              />
              <DateTimeSelector
                mode="date"
                selectedDate={endDate}
                setSelectedDate={setEndDate}
              />
            </View>
          </View>

          <View className="flex-row justify-between items-center mb-2">
            <TranslatedText 
              text="Time Slots" 
              className="text-xl font-bold ml-2 text-[#BD835D]"
            />
            <TouchableOpacity
              className="bg-pink-400 py-2 px-4 rounded mt-4 mx-2 items-center"
              onPress={addTimeSlot}
            >
              <TranslatedText 
                text="+ Add Slot" 
                className="text-white font-bold"
              />
            </TouchableOpacity>
          </View>

          {timeSlots.map((time, index) => (
            <View key={`timeslot-${index}`} className="mb-4 ml-2">
              <View className="flex-row justify-between items-center">
                <TranslatedText 
                  text={`Slot ${index + 1}:`}
                  className="font-medium"
                />
                <TouchableOpacity onPress={() => deleteTimeSlot(index)}>
                  <MaterialIcons name="delete" size={20} color="#ff4444" />
                </TouchableOpacity>
              </View>
              <View className="flex-row gap-2 mt-2">
                <View className="flex-1">
                  <TranslatedText 
                    text="From:" 
                    className="text-gray-600 mb-1"
                  />
                  <CustomTimePicker
                    key={`from-${index}`}
                    Hour={time.from.hour}
                    Minute={time.from.minute}
                    onTimeChange={handleTimeChange(index, "from")}
                  />
                </View>
                <View className="flex-1">
                  <TranslatedText 
                    text="To:" 
                    className="text-gray-600 mb-1"
                  />
                  <CustomTimePicker
                    key={`to-${index}`}
                    Hour={time.to.hour}
                    Minute={time.to.minute}
                    onTimeChange={handleTimeChange(index, "to")}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  });

  // SubjectsSlide Component
  const SubjectsSlide = memo(() => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newSubject, setNewSubject] = useState('');
    const [newTopics, setNewTopics] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const { translate } = useAppTranslation();

    const handleAddSubject = () => {
      setNewSubject('');
      setNewTopics('');
      setIsEditing(false);
      setIsModalVisible(true);
    };

    const handleEditSubject = (index) => {
      const subject = subjects[index];
      setNewSubject(subject.name);
      setNewTopics(subject.topics.join(', '));
      setEditIndex(index);
      setIsEditing(true);
      setIsModalVisible(true);
    };

    const handleSave = () => {
      if (!newSubject.trim()) {
        translate("Required").then(title => 
          translate("Subject name is required").then(message => 
            Alert.alert(title, message)
          )
        );
        return;
      }

      const topicsArray = newTopics.split(',')
        .map(topic => topic.trim())
        .filter(topic => topic.length > 0);

      if (topicsArray.length === 0) {
        translate("Required").then(title => 
          translate("At least one topic is required").then(message => 
            Alert.alert(title, message)
          )
        );
        return;
      }

      if (isEditing) {
        const updated = [...subjects];
        updated[editIndex] = { name: newSubject.trim(), topics: topicsArray };
        setSubjects(updated);
      } else {
        setSubjects(prev => [...prev, { name: newSubject.trim(), topics: topicsArray }]);
      }

      setIsModalVisible(false);
    };

    const handleRemoveTopic = (subjectIndex, topicIndex) => {
      if (subjects[subjectIndex].topics.length <= 1) {
        translate("Cannot Remove").then(title => 
          translate("At least one topic is required").then(message => 
            Alert.alert(title, message)
          )
        );
        return;
      }
      const updated = [...subjects];
      updated[subjectIndex].topics.splice(topicIndex, 1);
      setSubjects(updated);
    };

    const handleRemoveSubject = (subjectIndex) => {
      setSubjects(prev => prev.filter((_, index) => index !== subjectIndex));
    };

    return (
      <View className="flex-1 bg-pink-50 p-5 w-screen">
        <View className="flex-row justify-between items-center mb-4">
          <TranslatedText 
            text="Subjects & Topics" 
            className="text-xl font-bold text-[#BD835D]"
          />
          <TouchableOpacity
            className="bg-blue-500 py-2 px-4 rounded"
            onPress={handleAddSubject}
          >
            <TranslatedText 
              text="+ Add Subject" 
              className="text-white font-bold"
            />
          </TouchableOpacity>
        </View>

        {subjects.length === 0 ? (
          <View className="flex-1 justify-center items-center mt-10">
            <TranslatedText 
              text="No subjects added yet" 
              className="text-gray-500"
            />
          </View>
        ) : (
          <ScrollView className="flex-1">
            {subjects.map((subject, subjectIndex) => (
              <View key={`subject-${subjectIndex}`} className="bg-pink-100 rounded-lg p-4 mb-3">
                <View className="flex-row justify-between items-center mb-2">
                  <TranslatedText 
                    text={subject.name} 
                    className="text-lg font-semibold"
                  />
                  <View className="flex-row">
                    <TouchableOpacity
                      className="ml-3"
                      onPress={() => handleEditSubject(subjectIndex)}
                    >
                      <MaterialIcons name="edit" size={20} color="#555" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="ml-3"
                      onPress={() => handleRemoveSubject(subjectIndex)}
                    >
                      <MaterialIcons name="delete" size={20} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="flex-row flex-wrap gap-2">
                  {subject.topics.map((topic, topicIndex) => (
                    <View key={`topic-${topicIndex}`} className="flex-row items-center bg-gray-200 py-1 px-3 rounded-full">
                      <TranslatedText 
                        text={topic} 
                        className="mr-1"
                      />
                      <TouchableOpacity onPress={() => handleRemoveTopic(subjectIndex, topicIndex)}>
                        <MaterialIcons name="close" size={16} color="#ff4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        <Modal
          isVisible={isModalVisible}
          onBackdropPress={() => setIsModalVisible(false)}
          style={{ justifyContent: 'flex-end', margin: 0 }}
          backdropTransitionOutTiming={0}
          animationIn="slideInUp"
          animationOut="slideOutDown"
        >
          <View className="bg-white rounded-t-xl p-6" style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <TranslatedText 
              text={isEditing ? 'Edit Subject' : 'Add New Subject'} 
              className="text-xl font-bold text-center mb-5"
            />
            
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-4"
              placeholder={translation.language === 'en' ? "Subject name*" : 
                           translation.translate("Subject name*")}
              value={newSubject}
              onChangeText={setNewSubject}
              autoFocus
            />
            
            <TextInput
              className="border border-gray-300 rounded-lg p-3 h-24 mb-4 text-align-top"
              placeholder={translation.language === 'en' ? "Enter topics, separated by commas*" : 
                           translation.translate("Enter topics, separated by commas*")}
              value={newTopics}
              onChangeText={setNewTopics}
              multiline
            />
            
            <View className="flex-row justify-between mt-3">
              <TouchableOpacity
                className="bg-red-500 flex-1 py-3 rounded-lg mx-1 items-center"
                onPress={() => setIsModalVisible(false)}
              >
                <TranslatedText 
                  text="Cancel" 
                  className="text-white font-bold"
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                className="bg-blue-500 flex-1 py-3 rounded-lg mx-1 items-center"
                onPress={handleSave}
              >
                <TranslatedText 
                  text={isEditing ? 'Update' : 'Add'} 
                  className="text-white font-bold"
                />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  });

  // DifficultySlide Component
  const DifficultySlide = memo(() => {
    const [subjectsWithDifficulty, setSubjectsWithDifficulty] = useState(() => {
      return subjects.map(subject => {
        // Check if we already have proficiency data for this subject
        const existingSubject = subjectsWithDifficulty?.find(s => s.name === subject.name);
        
        return existingSubject || {
          ...subject,
          proficiency: 'moderate',
          topics: subject.topics.map(topic => {
            // Check if we already have proficiency data for this topic
            const existingTopic = existingSubject?.topics?.find(t => t.name === topic);
            return {
              name: topic,
              proficiency: existingTopic?.proficiency || 'moderate'
            };
          })
        };
      });
    });
  
    // Update state when subjects change
    React.useEffect(() => {
      setSubjectsWithDifficulty(prev => {
        const newSubjects = subjects.map(subject => {
          const existingSubject = prev?.find(s => s.name === subject.name);
          
          // If subject exists, keep its proficiency and update topics
          if (existingSubject) {
            const updatedTopics = subject.topics.map(topic => {
              const existingTopic = existingSubject.topics.find(t => t.name === topic) || 
                                 { name: topic, proficiency: 'moderate' };
              return existingTopic;
            });
            
            return {
              ...existingSubject,
              topics: updatedTopics
            };
          }
          
          // New subject
          return {
            ...subject,
            proficiency: 'moderate',
            topics: subject.topics.map(topic => ({
              name: topic,
              proficiency: 'moderate'
            }))
          };
        });
        
        return newSubjects;
      });
    }, [subjects]);

    const updateSubjectProficiency = (index, proficiency) => {
      const updated = [...subjectsWithDifficulty];
      updated[index].proficiency = proficiency;
      setSubjectsWithDifficulty(updated);
    };

    const updateTopicProficiency = (subjectIndex, topicIndex, proficiency) => {
      const updated = [...subjectsWithDifficulty];
      updated[subjectIndex].topics[topicIndex].proficiency = proficiency;
      setSubjectsWithDifficulty(updated);
    };

    const getProficiencyColor = (proficiency) => {
      switch (proficiency) {
        case 'hard': return 'bg-red-500';
        case 'easy': return 'bg-green-500';
        default: return 'bg-yellow-400';
      }
    };

    const getProficiencyBgColor = (proficiency) => {
      switch (proficiency) {
        case 'hard': return 'bg-red-100';
        case 'easy': return 'bg-green-100';
        default: return 'bg-yellow-100';
      }
    };

    return (
      <View className="flex-1 bg-pink-50 p-5 w-screen">
        <TranslatedText 
          text="Set Subject & Topic Proficiency" 
          className="text-xl font-bold mb-4"
        />

        <ScrollView className="flex-1">
          {/* Subjects Section */}
          <View className="mb-8">
            <TranslatedText 
              text="Subjects Proficiency" 
              className="text-lg font-bold mb-3"
            />
            {subjectsWithDifficulty.length === 0 ? (
              <TranslatedText 
                text="No subjects added" 
                className="text-gray-500 text-center"
              />
            ) : (
              subjectsWithDifficulty.map((subject, subjectIndex) => (
                <View
                  key={`subject-${subjectIndex}`}
                  className={`${getProficiencyBgColor(subject.proficiency)} flex-row items-center rounded-lg p-4 mb-3 border-l-4 border-gray-300`}
                >
                  <TranslatedText 
                    text={subject.name} 
                    className="text-lg flex-1"
                  />

                  <View className="flex-row mt-2">
                    {['easy', 'moderate', 'hard'].map((level) => (
                      <TouchableOpacity
                        key={level}
                        className={`${getProficiencyColor(level)} py-2 px-4 rounded-full mr-2 ${subject.proficiency === level ? 'border border-black' : ''}`}
                        onPress={() => updateSubjectProficiency(subjectIndex, level)}
                      >
                        <TranslatedText 
                          text={level.charAt(0).toUpperCase() + level.slice(1)} 
                          className="text-white font-bold text-xs"
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Topics Section */}
          <View>
            <TranslatedText 
              text="Topics Proficiency" 
              className="text-lg font-bold mb-3"
            />
            {subjectsWithDifficulty.length === 0 ? (
              <TranslatedText 
                text="No subjects available" 
                className="text-gray-500 text-center"
              />
            ) : (
              subjectsWithDifficulty.map((subject, subjectIndex) => (
                <View key={`topic-group-${subjectIndex}`} className="mb-6">
                  <TranslatedText 
                    text={subject.name} 
                    className="font-semibold mb-2"
                  />

                  {subject.topics.length === 0 ? (
                    <TranslatedText 
                      text="No topics added" 
                      className="text-gray-500 italic"
                    />
                  ) : (
                    subject.topics.map((topic, topicIndex) => (
                      <View
                        key={`topic-${topicIndex}`}
                        className={`${getProficiencyBgColor(topic.proficiency)} flex-row items-center rounded-lg p-3 mb-2 ml-4 border-l-4 border-gray-300`}
                      >
                        <TranslatedText 
                          text={topic.name} 
                          className="flex-1"
                        />

                        <View className="flex-row mt-1">
                          {['easy', 'moderate', 'hard'].map((level) => (
                            <TouchableOpacity
                              key={level}
                              className={`${getProficiencyColor(level)} py-1 px-3 rounded-full mr-2 ${topic.proficiency === level ? 'border border-black' : ''}`}
                              onPress={() => updateTopicProficiency(subjectIndex, topicIndex, level)}
                            >
                              <TranslatedText 
                                text={level.charAt(0).toUpperCase() + level.slice(1)} 
                                className="text-white font-bold text-xs"
                              />
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    ))
                  )}
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    );
  });

  // ReviewSlide Component
  const ReviewSlide = memo(() => {
    return (
      <View className="flex-1 bg-pink-50 p-5 w-screen">
        <TranslatedText 
          text="Review & Confirm" 
          className="text-xl font-bold mb-4"
        />

        <TranslatedText 
          text={`From: ${selectedDate.toDateString()}`} 
          className="mb-2"
        />
        <TranslatedText 
          text={`To: ${endDate.toDateString()}`} 
          className="mb-6"
        />

        <TranslatedText 
          text="Time Slots:" 
          className="font-bold mb-2"
        />
        {timeSlots.map((slot, index) => (
          <TranslatedText 
            key={`review-slot-${index}`}
            text={`Slot ${index + 1}: ${slot.from.hour.toString().padStart(2, "0")}:${slot.from.minute.toString().padStart(2, "0")} - ${slot.to.hour.toString().padStart(2, "0")}:${slot.to.minute.toString().padStart(2, "0")}`}
            className="mb-1"
          />
        ))}

        <TranslatedText 
          text="Subjects:" 
          className="font-bold mt-4 mb-2"
        />
        {subjects.map((subject, index) => (
          <TranslatedText 
            key={`review-subject-${index}`}
            text={`${subject.name}: ${subject.topics.join(', ')}`}
            className="mb-1"
          />
        ))}

        <TouchableOpacity
          className="bg-green-500 py-3 rounded-lg mt-6 items-center"
          onPress={() =>
            router.dismissTo({
              pathname: "/",
              params: {
                selectedDate: selectedDate.toISOString(),
                timeSlots: JSON.stringify(timeSlots),
                subjects,
              },
            })
          }
        >
          <TranslatedText 
            text="Confirm" 
            className="text-white font-bold"
          />
        </TouchableOpacity>
      </View>
    );
  });

  // Slides array
  const slidesArray = React.useMemo(() => [
    { id: "1", component: <DateAndTimeSlide /> },
    { id: "2", component: <SubjectsSlide /> },
    { id: "3", component: <DifficultySlide /> },
    { id: "4", component: <ReviewSlide /> },
  ], [DateAndTimeSlide, SubjectsSlide, ReviewSlide]);

  // Navigation functions
  const nextSlide = useCallback(() => {
    if (currentIndex < slidesArray.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, slidesArray.length]);

  const prevSlide = useCallback(() => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({ index: currentIndex - 1 });
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  return (
    <View className="flex-1 bg-pink-50">
      {/* Indicator */}
      <View className="flex-row justify-center mt-5">
        {slidesArray.map((_, index) => (
          <View
            key={`indicator-${index}`}
            className={`w-[20%] h-2 rounded-full mx-1 ${currentIndex === index ? 'bg-pink-700' : 'bg-gray-300'}`}
          />
        ))}
      </View>

      {/* Navigation buttons */}
      <View className="flex-row justify-end p-3">
        {currentIndex > 0 && (
          <TouchableOpacity
            className="py-3 px-5 rounded-lg mx-1 flex-row items-center gap-2"
            onPress={prevSlide}
          >
            <MaterialIcons name="arrow-back" color={"#AA7589"} />
            <TranslatedText 
              text="Previous" 
              className="font-bold text-[#AA7589]"
            />
          </TouchableOpacity>
        )}
        {currentIndex < slidesArray.length - 1 && (
          <TouchableOpacity
            className="py-3 px-5 rounded-lg mx-1 flex-row items-center gap-2"
            onPress={nextSlide}
          >
            <TranslatedText 
              text="Next" 
              className="font-bold text-[#AA7589]"
            />
            <MaterialIcons name="arrow-forward" color={"#AA7589"} />
          </TouchableOpacity>
        )}
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slidesArray}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => item.component}
        windowSize={1}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        getItemLayout={getItemLayout}
        onScrollToIndexFailed={({ index }) => {
          const wait = new Promise(resolve => setTimeout(resolve, 100));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({ index, animated: true });
          });
        }}
      />
    </View>
  );
};

export default withTranslation(Planner);