import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  ImageBackground, TouchableOpacity, LayoutAnimation,
  Platform, UIManager, FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '@env';
import { UseMethod } from '../composable/useMethod';
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MAX_INITIAL_COMMENTS = 3;

export default function EventDetailsScreen({ route, navigation }) {
  const { event, mode } = route.params;
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [isRegistered, setIsRegistered] = useState(event?.is_registered === 1);

  const [isAttend, setIsAttend] = useState(event?.is_attended === 1);
  const visibleComments = showAll ? comments : comments.slice(0, MAX_INITIAL_COMMENTS);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const handleLike = () => {
    setLiked(!liked);
  };

  const handleRating = (value) => {
    setRating(value);
  };
  const handleRegister = async () => {
    try {
      const res = await UseMethod("post", `event-registration/${event?.id}`);
      if (res && res.status === 200) {
        alert("Registered successfully!");
        setIsRegistered(true);
      } else {
        alert("Failed to register.");
      }
    } catch (error) {
      console.error("Register error:", error);
      alert("Something went wrong during registration.");
    }
  };

  const postComment = () => {
    if (comment.trim() === '' && rating === 0) return;
    setComments(prev => [...prev, { id: Date.now(), text: comment, rating }]);
    setComment('');
    setRating(0);
  };

  const formatDateTime = (date, time) => {
    const dt = new Date(`${date}T${time}`);
    return dt.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };
  // Check if the event has ended
  const now = new Date();
  const eventStart = new Date(`${event.start_date}T${event.start_time}`);

  const handleAttend = async () => {
    try {
      const res = await UseMethod("post", `mark-attend`, { event_id: event.id });
      if (res && res.status === 200) {
        alert("Attendance marked successfully!");
        setIsAttend(true);
      } else {
        alert("Failed to mark attendance.");
      }
    } catch (error) {
      console.error("Attendance error:", error);
      alert("Something went wrong while marking attendance.");
    }
  };
  const hasEventEnded = () => {
    return now > eventStart;
  };

  const canMarkAttendance = () => {
    const diffInMinutes = (eventStart - now) / (1000 * 60);
    return diffInMinutes <= 60 && diffInMinutes > 0;
  };

  const attendanceNotYetAvailable = () => {
    return isRegistered && !hasEventEnded() && !canMarkAttendance();
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit', minute: '2-digit'
    });
  };


  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} sx={{ marginBottom: 20 }}>
      {/* Header */}
      <ImageBackground
        source={{ uri: `${API_URL}/storage/${event.image}` }}
        style={styles.banner}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={30} color="black" />
        </TouchableOpacity>
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerTitle}>{event.title}</Text>
          <Text style={styles.bannerSubtitle}>
            {formatDateTime(event.start_date, event.start_time)} -   {formatDateTime(event.end_date, event.end_time)}
          </Text>
          <Text style={styles.bannerSubtitle}>
            {event.venue}
          </Text>
          <Text style={styles.bannerSubtitle}>
            Organized By:   {event.organizer}
          </Text>
        </View>
      </ImageBackground>

      {/* About Event */}
      <View style={styles.card}>

        <Text style={styles.sectionTitle}>About this event </Text>
        <Text style={styles.description}>{event.description || 'No description available.'}</Text>


        <TouchableOpacity style={styles.expandBtn} onPress={toggleExpand}>
          <Text style={styles.expandText}>{expanded ? 'See Less' : 'See More'}</Text>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color="#3b82f6" />
        </TouchableOpacity>

        {expanded && (
          <View style={styles.extraDetails}>
            <DetailRow icon="call" label="Contact" value={event.contact} />

            <DetailRow icon="call" label="Category" value={event.category} />

            {/* Start Date & Time */}
            <DetailRow
              icon="calendar"
              label="Start"
              value={`${formatDate(event.start_date)} at ${formatTime(event.start_time)}`}
            />

            {/* End Date & Time */}
            <DetailRow
              icon="calendar"
              label="End"
              value={`${formatDate(event.end_date)} at ${formatTime(event.end_time)}`}
            />
          </View>

        )}
      </View>
      <View style={styles.mapCard}>
                    <DetailRow icon="location" label="Address" value={event.address} />
        <TouchableOpacity
          style={styles.mapButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Map', { event, mode: 'register' })}
        >
          <Ionicons name="map-outline" size={20} color="#2563eb" style={{ marginRight: 6 }} />
          <Text style={styles.mapText}>Show Event Location on Map</Text>
        </TouchableOpacity>
      </View>

      {hasEventEnded() ? (
        <View style={styles.card}>
          <Text style={styles.infoText}>
            {isAttend
              ? '🎉 Thank you for coming to this event!'
              : '📌 This event has already ended.'}
          </Text>
        </View>
      ) : !isRegistered ? (
        <View style={styles.card}>
          <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
            <Text style={styles.registerText}>Register for Event</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>

          {isAttend ? (
            canMarkAttendance() ? (
              <View style={styles.card}>
                <Text style={styles.infoText}>🟢 The event is ongoing. Thanks for attending!</Text>
              </View>
            ) : (
              <View style={styles.card}>
                <Text style={styles.infoText}>🎉 Thank you for coming to this event!</Text>
              </View>
            )
          ) : canMarkAttendance() ? (
            <View style={styles.card}>
              <Text style={styles.infoText}>🕒 You can mark attendance now.</Text>
              <TouchableOpacity
                style={[styles.registerBtn, { backgroundColor: '#3b82f6' }]}
                onPress={handleAttend}
              >
                <Text style={styles.registerText}>Attend Event</Text>
              </TouchableOpacity>
            </View>
          ) : attendanceNotYetAvailable() ? (
            <View style={styles.card}>
              <Text style={styles.infoText}>📅 Attendance will be available 1 hour before the event starts.</Text>
            </View>
          ) : null}
        </>
      )}

      <View sx={{ marginTop: 20 }}></View>

   {hasEventEnded() && (
  <>
    {/* Only show review form if the user is registered */}
    {event.is_registered === 1 && (
      <View style={styles.card1}>
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map(val => (
            <TouchableOpacity key={val} onPress={() => handleRating(val)}>
              <Ionicons
                name={val <= rating ? 'star' : 'star-outline'}
                size={28}
                color="#facc15"
              />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Leave a Review</Text>
        <TextInput
          style={styles.reviewInput}
          placeholder="Share your experience..."
          value={comment}
          onChangeText={setComment}
          multiline
        />
        <TouchableOpacity style={styles.submitBtn} onPress={postComment}>
          <Text style={styles.submitText}>Submit Review</Text>
        </TouchableOpacity>
      </View>
    )}

    {/* Review Display Section */}
    <View style={styles.card2}>
      <Text style={styles.sectionTitle}>What People Are Saying</Text>

      <FlatList
        data={visibleComments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const rating = item.rating;
          const rounded = Math.round(rating * 2) / 2;
          const fullStars = Math.floor(rounded);
          const hasHalf = rounded % 1 !== 0;

          const getLabel = (rating) => {
            if (rating >= 4.5) return 'Excellent';
            if (rating >= 3.5) return 'Good';
            if (rating >= 2.5) return 'Fair';
            if (rating >= 1.5) return 'Poor';
            return 'Very Poor';
          };

          return (
            <View style={styles.commentBox}>
              <Text style={styles.reviewerName}>{item.name || 'Anonymous'}</Text>
              <View style={styles.starRow}>
                <Text style={styles.ratingScore}>{rating.toFixed(1)}</Text>
                {[...Array(fullStars)].map((_, i) => (
                  <Ionicons key={`f-${i}`} name="star" size={16} color="#facc15" />
                ))}
                {hasHalf && <Ionicons name="star-half" size={16} color="#facc15" />}
                {[...Array(5 - fullStars - (hasHalf ? 1 : 0))].map((_, i) => (
                  <Ionicons key={`e-${i}`} name="star-outline" size={16} color="#facc15" />
                ))}
                <Text style={styles.ratingLabel}>{getLabel(rating)}</Text>
              </View>
              <Text style={styles.commentText}>{item.text}</Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.noComments}>No reviews yet. Be the first to leave one!</Text>
        }
      />

      {comments.length > MAX_INITIAL_COMMENTS && (
        <TouchableOpacity onPress={() => setShowAll(!showAll)} style={styles.showMoreBtn}>
          <Text style={styles.showMoreText}>
            {showAll ? 'Show Less' : 'See More Reviews'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  </>
)}

    </ScrollView>
  );
}

const DetailRow = ({ icon, label, value }) => (
  <View style={{ flexDirection: 'row', marginVertical: 4 }}>
    <Ionicons name={icon} size={18} color="#3b82f6" style={{ marginRight: 8 }} />
    <View>
      <Text style={{ color: '#6b7280', fontWeight: '600' }}>{label}</Text>
      <Text style={{ color: '#1f2937' }}>{value || 'N/A'}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { backgroundColor: '#f3f4f6', flex: 1, marginBottom: 20 },
  banner: { height: 280, justifyContent: 'flex-end' },
  bannerOverlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 10,
  },
  bannerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  bannerSubtitle: { color: '#e5e7eb', fontSize: 13, marginTop: 4 },
  backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  card: {

    borderRadius: 16,
    marginHorizontal: 8,
    marginTop: 5,
    padding: 10,

  },
  cardTopBorder: {
    height: 8, // adjust thickness here
    backgroundColor: '#4A90E2', // choose any highlight color
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  card1: {
    TopBorderRadius: 16,
    marginHorizontal: 8,


    marginHorizontal: 16,
    marginTop: 5,
    padding: 2,

  },
  card2: {

    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 5,
    padding: 10,
    marginBottom: 50,

  },
  mapCard: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 12,
    backgroundColor: '#eff6ff',
    borderColor: '#dbeafe',
    borderWidth: 1,
    alignItems: 'flex-start',
  },

  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignSelf: 'center',
  },

  mapText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#111827',
  },
  description: { fontSize: 14, color: '#374151', lineHeight: 20 },
  expandBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  expandText: { color: '#3b82f6', fontWeight: '600', marginRight: 4 },
  extraDetails: { marginTop: 12 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  likeButton: { flexDirection: 'row', alignItems: 'center' },
  likeText: { marginLeft: 6, color: '#1e3a8a', fontWeight: '500' },
  ratingRow: { flexDirection: 'row' },
  reviewInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 12,
    minHeight: 60,
    marginBottom: 10,
  },
  submitBtn: {
    backgroundColor: '#1d4ed8',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 10,
  },
  registerBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  registerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  submitText: { color: '#fff', fontWeight: '600' },
  ratingRow: {
  flexDirection: 'row',
  justifyContent: 'center',
  marginVertical: 12,
},
reviewInput: {
  borderWidth: 1,
  borderColor: '#d1d5db',
  borderRadius: 8,
  padding: 10,
  minHeight: 80,
  textAlignVertical: 'top',
  backgroundColor: '#f9fafb',
},
submitBtn: {
  backgroundColor: '#1e3a8a',
  paddingVertical: 10,
  borderRadius: 8,
  alignItems: 'center',
  marginTop: 10,
},
submitText: {
  color: '#fff',
  fontWeight: '600',
},
card1: {
  padding: 16,
  backgroundColor: '#fff',
  marginVertical: 8,
  borderRadius: 10,
  elevation: 3,
},
card2: {
  padding: 16,
  backgroundColor: '#fff',
  marginVertical: 8,
  borderRadius: 10,
  elevation: 3,
},
sectionTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  marginBottom: 8,
},
commentBox: {
  backgroundColor: '#f3f4f6',
  padding: 12,
  borderRadius: 8,
  marginBottom: 10,
},
reviewerName: {
  fontWeight: 'bold',
  marginBottom: 4,
},
commentText: {
  fontSize: 14,
  color: '#374151',
},
noComments: {
  textAlign: 'center',
  marginVertical: 20,
  color: '#9ca3af',
},
showMoreBtn: {
  paddingVertical: 8,
  alignItems: 'center',
},
showMoreText: {
  color: '#2563eb',
  fontWeight: '500',
},
starRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 4,
},
ratingScore: {
  fontWeight: 'bold',
  marginRight: 6,
},
ratingLabel: {
  marginLeft: 6,
  fontStyle: 'italic',
  color: '#6b7280',
  fontSize: 12,
},

});
