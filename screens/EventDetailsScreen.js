import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  ImageBackground, TouchableOpacity, LayoutAnimation,
  Platform, UIManager, FlatList, Modal, Animated
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
  useEffect(() => {
    navigation.setOptions({ title: event?.title || 'Event Details' });
  }, [navigation, event?.title]);
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [isRegistered, setIsRegistered] = useState(event?.is_registered === 1);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [ratings, setRatings] = useState({
    venue: 0,
    speaker: 0,
    events: 0,
    foods: 0,
    accommodation: 0
  });
  const [modalAnimation] = useState(new Animated.Value(0));

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

  const handleCategoryRating = (category, value) => {
    setRatings(prev => ({ ...prev, [category]: value }));
  };

  const openReviewModal = (existingReview = null) => {
    if (existingReview) {
      // Prefill modal with existing review values
      const existingRatings = existingReview.category_ratings || {};
      setRatings({
        venue: existingRatings.venue || 0,
        speaker: existingRatings.speaker || 0,
        events: existingRatings.events || 0,
        foods: existingRatings.foods || 0,
        accommodation: existingRatings.accommodation || 0,
      });
      setComment(existingReview.comment || existingReview.text || '');
      setRating(existingReview.rating || 0);
    }
    setShowReviewModal(true);
    Animated.spring(modalAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const closeReviewModal = () => {
    Animated.spring(modalAnimation, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8
    }).start(() => {
      setShowReviewModal(false);
      setRatings({ venue: 0, speaker: 0, events: 0, foods: 0, accommodation: 0 });
      setComment('');
    });
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

  const postComment = async () => {
    // Calculate overall rating as average of all category ratings
    const categoryValues = Object.values(ratings).filter(val => val > 0);
    const overallRating = categoryValues.length > 0
      ? Math.round(categoryValues.reduce((sum, val) => sum + val, 0) / categoryValues.length)
      : 0;

    if (comment.trim() === '' && overallRating === 0) {
      alert('Please provide a rating or comment before submitting.');
      return;
    }

    try {
      // Check if user already has a review for this event
      const existingUserReview = comments.find(c => c.is_user_review);

      const reviewData = {
        reviewId: existingUserReview ? existingUserReview.id : null,
        rating: overallRating,
        comment: comment.trim(),
        category_ratings: {
          venue: ratings.venue || 0,
          speaker: ratings.speaker || 0,
          events: ratings.events || 0,
          foods: ratings.foods || 0,
          accommodation: ratings.accommodation || 0
        }
      };

      console.log('Submitting review data:', reviewData);
      const response = await UseMethod('post', `events/${event.id}/review`, reviewData);

      if (response && (response.status === 201 || response.status === 200)) {
        const serverReview = response?.data?.review || {};
        const updatedReview = {
          id: serverReview.id ?? existingUserReview?.id ?? null,
          text: serverReview.comment ?? comment.trim(),
          rating: serverReview.rating ?? overallRating,
          category_ratings: serverReview.category_ratings ?? { ...ratings },
          name: 'You',
          date: new Date(serverReview.created_at ?? Date.now()).toLocaleDateString(),
          created_at: serverReview.created_at ?? new Date().toISOString(),
          is_user_review: true
        };

        if (existingUserReview) {
          // Update existing review in local state
          setComments(prev => prev.map(c =>
            c.is_user_review ? updatedReview : c
          ));
          alert('Review updated successfully!');
        } else {
          // Add new review to local state
          setComments(prev => [...prev, updatedReview]);
          alert('Review submitted successfully!');
        }

        // Ensure UI reflects backend state
        await fetchReviews();
        closeReviewModal();
      } else if (response === null) {
        // UseMethod returns null on error
        alert('Failed to submit review. Please check your connection and try again.');
      } else if (response.status === 409 && response.data?.error === 'duplicate_review') {
        // Handle duplicate review error
        alert('You have already submitted a review for this event. You can only edit your existing review.');
      } else {
        console.error('Review submission failed:', response);
        alert(`Failed to submit review: ${response?.data?.message || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Review submission error:', error);
      alert('Something went wrong while submitting your review.');
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await UseMethod('get', `events/${event.id}/reviews`);
      if (response && response.status === 200 && response.data.reviews) {
        const formattedReviews = response.data.reviews.map(review => ({
          id: review.id,
          text: review.comment,
          rating: review.rating,
          name: review.user?.name || 'Anonymous',
          date: new Date(review.created_at).toLocaleDateString(),
          category_ratings: {
            venue: review.category_ratings?.venue || 0,
            speaker: review.category_ratings?.speaker || 0,
            events: review.category_ratings?.events || 0,
            foods: review.category_ratings?.foods || 0,
            accommodation: review.category_ratings?.accommodation || 0
          },
          is_user_review: review.is_mine || false
        }));
        setComments(formattedReviews);
        console.log('Fetched reviews:', formattedReviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  useEffect(() => {
    if (hasEventEnded()) {
      fetchReviews();
    }
  }, [event.id]);

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

  // Check if the event has ended
  const hasEventEnded = () => {
    const now = new Date();
    const eventEnd = new Date(`${event.end_date || event.start_date}T${event.end_time || event.start_time}`);
    return now >= eventEnd;
  };

  // Check if the event has started
  const hasEventStarted = () => {
    const now = new Date();
    const eventStart = new Date(`${event.start_date}T${event.start_time}`);
    return now >= eventStart;
  };

  const canMarkAttendance = () => {
    const now = new Date();
    const eventStart = new Date(`${event.start_date}T${event.start_time}`);
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
    if (!timeStr || typeof timeStr !== 'string') {
      return 'N/A';
    }

    const timeParts = timeStr.split(':');
    if (timeParts.length < 2) {
      return timeStr; // Return original if not in expected format
    }

    const [hours, minutes] = timeParts;
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit', minute: '2-digit'
    });
  };


  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} sx={{ marginBottom: 20 }}>
        {/* Header */}
        <ImageBackground
          source={{ uri: `${API_URL}/storage/${event.image}` }}
          style={styles.banner}
        >


        </ImageBackground>

        {/* Modern Event Details Cards */}
        <View style={styles.modernDetailsContainer}>
          {/* Quick Info Card */}
          <View style={styles.modernCard}>
            <View style={styles.compactCardHeader}>
              <View style={styles.headerIconContainer}>
                <Ionicons name="flash" size={18} color="#ffffff" />
              </View>
              <Text style={styles.compactCardTitle}>Event Overview</Text>
            </View>
            <View style={styles.compactInfoGrid}>
              <View style={[styles.compactInfoItem, { borderLeftColor: '#10b981' }]}>
                <Ionicons name="calendar-outline" size={16} color="#10b981" />
                <View style={styles.compactInfoContent}>
                  <Text style={styles.compactInfoLabel}>Duaration</Text>
                  <Text style={styles.compactInfoValue}>{formatDate(event.start_date)} - {formatDate(event.end_date)}</Text>
                  <Text style={styles.compactInfoValue}>{formatTime(event.start_time)} - {formatTime(event.end_time)}</Text>
                </View>
              </View>

              <View style={[styles.compactInfoItem, { borderLeftColor: '#ef4444' }]}>
                <Ionicons name="location-outline" size={16} color="#ef4444" />
                <View style={styles.compactInfoContent}>
                  <Text style={styles.compactInfoLabel}>Address and Venue</Text>
                  <Text style={styles.compactInfoValue} numberOfLines={1}>{event.venue || 'Venue not specified'}</Text>
                  <Text style={styles.compactInfoValue} numberOfLines={1}> at the {event.address || 'Address not specified'}</Text>
                  <TouchableOpacity style={styles.compactMapButton} onPress={() => navigation.navigate('Map', { event, mode: 'register' })}>
                    <Ionicons name="map-outline" size={16} color="#ef4444" />
                    <Text style={styles.compactMapButtonText}>View Map</Text>
                    <Ionicons name="chevron-forward" size={14} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={[styles.compactInfoItem, { borderLeftColor: '#8b5cf6' }]}>
                <Ionicons name="person-outline" size={16} color="#8b5cf6" />
                <View style={styles.compactInfoContent}>
                  <Text style={styles.compactInfoLabel}>Organizer</Text>
                  <Text style={styles.compactInfoValue}>{event.organizer || 'Organizer not specified'}</Text>
                  <Text style={styles.compactInfoValue}>{event.contact || 'Contact not available'}</Text>
                </View>
              </View>
              <View style={[styles.compactInfoItem, { borderLeftColor: '#8b5cf6' }]}>
                <Ionicons name="pricetag-outline" size={16} color="#8b5cf6" />
                <View style={styles.compactInfoContent}>
                  <Text style={styles.compactInfoLabel}>Category and Church Location</Text>
                  <Text style={styles.compactInfoValue}>{event?.event_types && Array.isArray(event.event_types) ? event.event_types.map((type) => type?.code || 'Unknown').join(", ") : "None"}
                  </Text>
                  <Text style={styles.compactInfoValue}>
                    {event?.locations && Array.isArray(event.locations) && event.locations.length > 0
                      ? event.locations.map(loc => loc?.name || 'Unknown Location').filter(Boolean).join(', ') || event?.venue || 'N/A'
                      : event?.venue || 'N/A'
                    }
                  </Text>
                </View>
              </View>
            </View>
          </View>


        </View>
        {/* Map Card
        <View style={styles.modernCard}>
          <View style={styles.compactCardHeader}>
            <View style={[styles.headerIconContainer, { backgroundColor: '#ef4444' }]}>
              <Ionicons name="location" size={18} color="#ffffff" />
            </View>
            <Text style={styles.compactCardTitle}>Event Location</Text>
          </View>
          <View style={styles.compactLocationInfo}>
            <Text style={styles.compactAddress}>{event?.address || 'Address not specified'}</Text>
            <TouchableOpacity style={styles.compactMapButton} onPress={() => navigation.navigate('Map', { event, mode: 'register' })}>
              <Ionicons name="map-outline" size={16} color="#ef4444" />
              <Text style={styles.compactMapButtonText}>View Map</Text>
              <Ionicons name="chevron-forward" size={14} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View> */}

        {hasEventEnded() ? (
          <View></View>
        ) : !isRegistered ? (
          hasEventStarted() ? (
            <View style={styles.card}>
              <Text style={styles.infoText}>🚫 Event already started — registration is closed.</Text>
            </View>
          ) : (
            <View style={styles.card}>
              <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
                <Text style={styles.registerText}>Register for Event</Text>
              </TouchableOpacity>
            </View>
          )
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
                <Text style={styles.infoText}>🎟️ Thank you for registering! Attendance will be available 1 hour before the event starts.</Text>
              </View>
            ) : null}
          </>
        )}

        <View sx={{ marginTop: 20 }}></View>

        {hasEventEnded() && (
          <>
            {/* Modern Review Section */}
            {event.is_registered === 1 && isAttend && (
              <View style={styles.modernReviewContainer}>
                <View style={styles.modernCard}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="star" size={24} color="#f59e0b" />
                    <Text style={styles.cardTitle}>My Event Review</Text>
                  </View>

                  {/* User's Review Display */}
                  <View style={styles.userReviewSection}>
                    {/* Show Write Review button only if user hasn't reviewed yet */}
                    {comments.filter(comment => comment.is_user_review).length === 0 && (
                      <TouchableOpacity style={styles.webReviewButton} onPress={() => openReviewModal(null)}>
                        <View style={styles.webReviewBtnContent}>
                          <View style={styles.webReviewBtnLeft}>
                            <View style={styles.webReviewBtnIcon}>
                              <Ionicons name="create-outline" size={18} color="#1976d2" />
                            </View>
                            <View style={styles.webReviewBtnTextContainer}>
                              <Text style={styles.webReviewBtnTitle}>Write Your Review</Text>
                              <Text style={styles.webReviewBtnSubtitle}>Share your experience with others</Text>
                            </View>
                          </View>
                          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
                        </View>
                      </TouchableOpacity>
                    )}

                    {/* Display existing user review if any */}
                    {comments.filter(comment => comment.is_user_review).length > 0 && (
                      <View style={styles.webStyleReviewCard}>
                        <View style={styles.webReviewHeader}>
                          <Text style={styles.webReviewTitle}>Your Review</Text>
                          <TouchableOpacity style={styles.webEditButton} onPress={() => openReviewModal(comments.find(c => c.is_user_review))}>
                            <Ionicons name="create-outline" size={14} color="#1976d2" />
                            <Text style={styles.webEditButtonText}>Edit</Text>
                          </TouchableOpacity>
                        </View>

                        {/* Category Ratings Display */}
                        {comments.find(c => c.is_user_review)?.category_ratings && (
                          <View style={styles.webRatingsContainer}>
                            <View style={styles.webRatingsHeader}>
                              <Text style={styles.webRatingsTitle}>📊 Your Ratings</Text>
                            </View>
                            <View style={styles.webRatingsGrid}>
                              {comments.find(c => c.is_user_review)?.category_ratings && Object.entries(comments.find(c => c.is_user_review).category_ratings).map(([category, rating]) => (
                                rating > 0 && (
                                  <View key={category} style={styles.webRatingItem}>
                                    <Text style={styles.webRatingCategory}>{category}</Text>
                                    <View style={styles.webRatingStars}>
                                      {[1, 2, 3, 4, 5].map(star => (
                                        <Ionicons
                                          key={star}
                                          name={star <= rating ? 'star' : 'star-outline'}
                                          size={12}
                                          color={star <= rating ? '#ffa726' : '#e0e0e0'}
                                        />
                                      ))}
                                    </View>
                                  </View>
                                )
                              ))}
                            </View>
                          </View>
                        )}

                        {/* Comment Display */}
                        {comments.find(c => c.is_user_review)?.comment && (
                          <View style={styles.webCommentContainer}>
                            <View style={styles.webCommentBorder} />
                            <Text style={styles.webCommentText}>
                              {comments.find(c => c.is_user_review)?.comment}
                            </Text>
                          </View>
                        )}

                        <Text style={styles.webReviewDate}>
                          {new Date(comments.find(c => c.is_user_review)?.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* All Reviews Section */}
            {comments.length > 0 && (
              <View style={styles.modernCard}>
                <View style={styles.compactCardHeader}>
                  <View style={[styles.headerIconContainer, { backgroundColor: '#10b981' }]}>
                    <Ionicons name="chatbubbles" size={18} color="#ffffff" />
                  </View>
                  <Text style={styles.compactCardTitle}>Event Reviews</Text>
                </View>

                {visibleComments.map((review, index) => (
                  <View key={index} style={styles.modernCommentBox}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewerInfo}>

                        <Text style={styles.reviewDate}>{review.date}</Text>
                      </View>
                      {review.rating > 0 && (
                        <View style={styles.ratingContainer}>
                          <Text style={styles.ratingScore}>{review.rating}</Text>
                          <View style={styles.starsContainer}>
                            {[1, 2, 3, 4, 5].map(star => (
                              <Ionicons
                                key={star}
                                name={star <= review.rating ? 'star' : 'star-outline'}
                                size={14}
                                color={star <= review.rating ? '#ffa726' : '#e0e0e0'}
                              />
                            ))}
                          </View>
                        </View>
                      )}
                    </View>

                    {/* Category Ratings */}
                    {review.category_ratings && Object.values(review.category_ratings).some(rating => rating > 0) && (
                      <View style={styles.categoryRatingsDisplay}>
                        <Text style={styles.categoryRatingsTitle}>Category Ratings:</Text>
                        <View style={styles.categoryRatingsGrid}>
                          {review.category_ratings && Object.entries(review.category_ratings).map(([category, rating]) => (
                            rating > 0 && (
                              <View key={category} style={styles.categoryRatingItem}>
                                <Text style={styles.categoryName}>{category}</Text>
                                <View style={styles.categoryStars}>
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <Ionicons
                                      key={star}
                                      name={star <= rating ? 'star' : 'star-outline'}
                                      size={10}
                                      color={star <= rating ? '#ffa726' : '#e0e0e0'}
                                    />
                                  ))}
                                </View>
                              </View>
                            )
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Comment Text */}
                    {review.text && review.text.trim() !== '' && (
                      <Text style={styles.commentText}>{review.text}</Text>
                    )}
                  </View>
                ))}

                {comments.length > MAX_INITIAL_COMMENTS && (
                  <TouchableOpacity
                    style={styles.showMoreButton}
                    onPress={() => setShowAll(!showAll)}
                  >
                    <Text style={styles.showMoreText}>
                      {showAll ? 'Show Less' : `Show All ${comments.length} Reviews`}
                    </Text>
                    <Ionicons
                      name={showAll ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color="#3b82f6"
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Show message if not attended */}
            {event.is_registered === 1 && !isAttend && (
              <View style={styles.modernCard}>
                <View style={styles.noReviewMessage}>
                  <Ionicons name="information-circle" size={48} color="#6b7280" />
                  <Text style={styles.noReviewTitle}>Review Not Available</Text>
                  <Text style={styles.noReviewText}>You can only write a review after attending the event.</Text>
                </View>
              </View>
            )}
          </>
        )}

      </ScrollView>

      {/* Modern Review Modal */}
      <Modal
        visible={showReviewModal}
        transparent={false}
        animationType="slide"
        onRequestClose={closeReviewModal}
      >
        <View style={styles.fullScreenModal}>
          {/* Header */}
          <View style={styles.fullScreenHeader}>
            <TouchableOpacity onPress={closeReviewModal} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.fullScreenTitle}>My Review</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView style={styles.fullScreenContent} showsVerticalScrollIndicator={false}>
            {/* Category Ratings - Web Frontend Style */}
            <View style={styles.webCategoryRatingSection}>
              <Text style={styles.webSectionTitle}>Rate Different Aspects:</Text>
              <View style={styles.webCategoryStack}>
                {[
                  { key: 'venue', label: 'Venue', icon: 'business', description: 'Location, facilities, ambiance' },
                  { key: 'speaker', label: 'Speaker', icon: 'mic', description: 'Presentation quality, knowledge' },
                  { key: 'events', label: 'Events', icon: 'calendar', description: 'Organization, content, timing' },
                  { key: 'foods', label: 'Food', icon: 'restaurant', description: 'Quality, variety, service' },
                  { key: 'accommodation', label: 'Accommodation', icon: 'bed', description: 'Comfort, cleanliness, service' }
                ].map((category) => (
                  <View key={category.key} style={styles.webCategoryItem}>
                    <View style={styles.webCategoryLeft}>
                      <View style={styles.webCategoryIconContainer}>
                        <Ionicons name={category.icon} size={20} color="#1976d2" />
                      </View>
                      <View style={styles.webCategoryInfo}>
                        <Text style={styles.webCategoryLabel}>{category.label}</Text>
                        <Text style={styles.webCategoryDescription}>{category.description}</Text>
                      </View>
                    </View>
                    <View style={styles.webCategoryRating}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <TouchableOpacity
                          key={star}
                          onPress={() => handleCategoryRating(category.key, star)}
                          style={styles.webStarButton}
                        >
                          <Ionicons
                            name={star <= ratings[category.key] ? 'star' : 'star-outline'}
                            size={18}
                            color={star <= ratings[category.key] ? '#ff6d00' : '#e0e0e0'}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Comment Section - Web Frontend Style */}
            <View style={styles.webCommentSection}>
              <Text style={styles.webSectionTitle}>Additional Comments:</Text>
              <TextInput
                style={styles.webTextInput}
                placeholder="Share your detailed thoughts and feedback..."
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Submit Button - Web Frontend Style */}
            <View style={styles.webActionButtons}>
              <TouchableOpacity style={styles.webSubmitBtn} onPress={postComment}>
                <Ionicons name="send" size={16} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.webSubmitText}>Submit Review</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
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

const ModernDetailRow = ({ icon, label, value, color = '#3b82f6' }) => (
  <View style={styles.compactDetailRow}>
    <View style={[styles.compactDetailIcon, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon} size={14} color={color} />
    </View>
    <View style={styles.compactDetailContent}>
      <Text style={styles.compactDetailLabel}>{label}</Text>
      <Text style={styles.compactDetailValue}>{value || 'Not specified'}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { backgroundColor: '#f8fafc', flex: 1, marginBottom: 20 },
  banner: { margin: 6, height: 140, justifyContent: 'flex-end', borderRadius: 2 },
  bannerOverlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 10,
  },
  bannerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  bannerSubtitle: { color: '#e5e7eb', fontSize: 13, marginTop: 4 },
  backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  card: {
    backgroundColor: '#fff',
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
    backgroundColor: '#fff',
    borderTopRadius: 16,
    marginHorizontal: 8,
    marginTop: 5,
    padding: 2,

  },
  card2: {
    backgroundColor: '#fff',
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
  },

  // Review Display Styles
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginLeft: 4,
  },
  categoryRatingsDisplay: {
    marginTop: 12,
    marginBottom: 8,
  },
  categoryRatingsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  categoryRatingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryRatingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 11,
    color: '#6b7280',
    marginRight: 4,
    textTransform: 'capitalize',
  },
  categoryStars: {
    flexDirection: 'row',
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginTop: 8,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  showMoreText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
    marginRight: 4,
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

  // Compact Review Button Styles
  compactReviewButtonContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  compactReviewBtn: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  compactReviewBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactReviewBtnText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginLeft: 8,
  },

  // Full Screen Modal Styles
  fullScreenModal: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  fullScreenHeader: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  fullScreenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  fullScreenContent: {
    flex: 1,
    padding: 16,
  },



  // Modern Comment Display
  modernCommentBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  overallRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryRatingsDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  categoryRatingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryRatingLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 4,
    fontWeight: '500',
  },
  categoryRatingStars: {
    flexDirection: 'row',
  },

  // Modern Design Styles
  modernDetailsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  modernCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 12,
  },
  quickInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  infoIcon: {
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  modernDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 8,
  },
  modernDetailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modernDetailContent: {
    flex: 1,
  },
  modernDetailLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 2,
  },
  modernDetailValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  modernReviewContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  webWriteReviewBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  webReviewBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  webReviewBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  webReviewBtnIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  webReviewBtnTextContainer: {
    flex: 1,
  },
  webReviewBtnTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  webReviewBtnSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '400',
  },
  userReviewSection: {
    marginTop: 8,
  },

  noReviewMessage: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noReviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  noReviewText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Web-style review card styles
  webStyleReviewCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  webReviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  webReviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  webEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#f3f4f6',
  },
  webEditButtonText: {
    fontSize: 12,
    color: '#1976d2',
    marginLeft: 4,
    fontWeight: '500',
  },
  webRatingsContainer: {
    marginBottom: 12,
  },
  webRatingsHeader: {
    marginBottom: 8,
  },
  webRatingsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  webRatingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  webRatingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  webRatingCategory: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 6,
    textTransform: 'capitalize',
  },
  webRatingStars: {
    flexDirection: 'row',
  },
  webCommentContainer: {
    marginBottom: 12,
  },
  webCommentBorder: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginBottom: 8,
  },
  webCommentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  webReviewDate: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  // Web-style review modal styles
  webCategoryRatingSection: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  webSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  webCategoryStack: {
    gap: 12,
  },
  webCategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  webCategoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  webCategoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webCategoryInfo: {
    flex: 1,
  },
  webCategoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  webCategoryDescription: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
  webCategoryRating: {
    flexDirection: 'row',
    gap: 4,
  },
  webStarButton: {
    padding: 2,
  },
  webCommentSection: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  webTextInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    fontSize: 14,
    color: '#374151',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  webActionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  webSubmitBtn: {
    backgroundColor: '#1976d2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  webSubmitText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Compact Card Header Styles
  compactCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  compactCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },

  // Compact Info Grid Styles
  compactInfoGrid: {
    gap: 8,
  },
  compactInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
  },
  compactInfoContent: {
    marginLeft: 12,
    flex: 1,
  },
  compactInfoLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  compactInfoValue: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '600',
  },

  // Compact Description and Expand Styles
  compactDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  compactExpandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginVertical: 8,
  },
  compactExpandButtonText: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: '600',
    marginRight: 4,
  },
  compactExpandedDetails: {
    marginTop: 12,
    gap: 8,
  },

  // Compact Detail Row Styles
  compactDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  compactDetailIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  compactDetailContent: {
    flex: 1,
  },
  compactDetailLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  compactDetailValue: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '500',
  },

  // Compact Location Styles
  compactLocationInfo: {
    gap: 12,
  },
  compactAddress: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  compactMapButton: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  compactMapButtonText: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },

});


