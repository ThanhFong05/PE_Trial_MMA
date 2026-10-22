import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { SelectPicker } from '../components/SelectPicker';
import { useAuth } from '../context/AuthContext';
import { useBooks } from '../context/BookContext';

const GENRE_OPTIONS = [
  { label: 'Choose genre', value: '' },
  { label: 'Fiction', value: 'Fiction' },
  { label: 'Non-Fiction', value: 'Non-Fiction' },
  { label: 'Academic', value: 'Academic' },
  { label: 'Other', value: 'Other' },
];

const STATUS_OPTIONS = [
  { label: 'Choose status', value: '' },
  { label: 'To Read', value: 'To Read' },
  { label: 'Reading', value: 'Reading' },
  { label: 'Finished', value: 'Finished' },
];

const GENRE_FILTER_OPTIONS = ['All', 'Fiction', 'Non-Fiction', 'Academic', 'Other'];
const STATUS_FILTER_OPTIONS = ['All', 'To Read', 'Reading', 'Finished'];

const STATUS_PRIORITY = {
  'To Read': 1,
  'Reading': 2,
  'Finished': 3,
};

export const ListScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { books, loading: booksLoading, addBook, toggleFavorite } = useBooks();

  // Add Book Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [status, setStatus] = useState('');
  const [rating, setRating] = useState('');
  const [notes, setNotes] = useState('');

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [bookSuccess, setBookSuccess] = useState('');
  const [errorBook, setErrorBook] = useState('');
  const [addingBook, setAddingBook] = useState(false);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenreFilter, setSelectedGenreFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // Form Validation
  const validateBookForm = (t, a, g, s, r, n) => {
    const errs = {};
    const tTrim = (t || '').trim();
    if (!tTrim) {
      errs.title = 'Title is required';
    } else if (t.length > 100) {
      errs.title = 'Title must be at most 100 characters';
    }

    const aTrim = (a || '').trim();
    if (!aTrim) {
      errs.author = 'Author is required';
    } else if (a.length > 60) {
      errs.author = 'Author must be at most 60 characters';
    }

    if (!g) {
      errs.genre = 'Please choose a genre';
    }

    if (!s) {
      errs.status = 'Please choose a status';
    }

    if (r !== '' && r !== null && r !== undefined) {
      const rTrim = String(r).trim();
      if (!/^[0-5]$/.test(rTrim)) {
        errs.rating = 'Rating must be a whole number from 0 to 5';
      }
    }

    if (n && n.length > 300) {
      errs.notes = 'Notes must be at most 300 characters';
    }

    return errs;
  };

  const handleTitleChange = (val) => {
    setTitle(val);
    if (formSubmitted) {
      const nextErrs = { ...formErrors };
      const trim = val.trim();
      if (!trim) {
        nextErrs.title = 'Title is required';
      } else if (val.length > 100) {
        nextErrs.title = 'Title must be at most 100 characters';
      } else {
        delete nextErrs.title;
      }
      setFormErrors(nextErrs);
    }
  };

  const handleAuthorChange = (val) => {
    setAuthor(val);
    if (formSubmitted) {
      const nextErrs = { ...formErrors };
      const trim = val.trim();
      if (!trim) {
        nextErrs.author = 'Author is required';
      } else if (val.length > 60) {
        nextErrs.author = 'Author must be at most 60 characters';
      } else {
        delete nextErrs.author;
      }
      setFormErrors(nextErrs);
    }
  };

  const handleGenreChange = (val) => {
    setGenre(val);
    if (formSubmitted) {
      const nextErrs = { ...formErrors };
      if (!val) {
        nextErrs.genre = 'Please choose a genre';
      } else {
        delete nextErrs.genre;
      }
      setFormErrors(nextErrs);
    }
  };

  const handleStatusChange = (val) => {
    setStatus(val);
    if (formSubmitted) {
      const nextErrs = { ...formErrors };
      if (!val) {
        nextErrs.status = 'Please choose a status';
      } else {
        delete nextErrs.status;
      }
      setFormErrors(nextErrs);
    }
  };

  const handleRatingChange = (val) => {
    setRating(val);
    if (formSubmitted) {
      const nextErrs = { ...formErrors };
      if (val !== '' && val !== null && val !== undefined) {
        if (!/^[0-5]$/.test(String(val).trim())) {
          nextErrs.rating = 'Rating must be a whole number from 0 to 5';
        } else {
          delete nextErrs.rating;
        }
      } else {
        delete nextErrs.rating;
      }
      setFormErrors(nextErrs);
    }
  };

  const handleNotesChange = (val) => {
    setNotes(val);
    if (formSubmitted) {
      const nextErrs = { ...formErrors };
      if (val && val.length > 300) {
        nextErrs.notes = 'Notes must be at most 300 characters';
      } else {
        delete nextErrs.notes;
      }
      setFormErrors(nextErrs);
    }
  };

  // Submit Add Book
  const handleAddBook = async () => {
    setFormSubmitted(true);
    setBookSuccess('');
    setErrorBook('');

    const validationErrs = validateBookForm(title, author, genre, status, rating, notes);
    setFormErrors(validationErrs);

    if (Object.keys(validationErrs).length > 0) {
      return;
    }

    try {
      setAddingBook(true);
      await addBook({
        title,
        author,
        genre,
        status,
        rating,
        notes,
      });

      // Success
      setBookSuccess('Book added');
      setTitle('');
      setAuthor('');
      setGenre('');
      setStatus('');
      setRating('');
      setNotes('');
      setFormSubmitted(false);
      setFormErrors({});
    } catch (err) {
      setErrorBook(err.message || 'Failed to add book. Please try again.');
    } finally {
      setAddingBook(false);
    }
  };

  // Reset Filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedGenreFilter('All');
    setSelectedStatusFilter('All');
    setFavoritesOnly(false);
  };

  // Filtered and Searched Books
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      // Genre filter
      if (selectedGenreFilter !== 'All' && b.genre !== selectedGenreFilter) {
        return false;
      }

      // Status filter
      if (selectedStatusFilter !== 'All' && b.status !== selectedStatusFilter) {
        return false;
      }

      // Favorites only
      if (favoritesOnly && !b.favorite) {
        return false;
      }

      // Search box (title or author contains query, not case-sensitive, trimmed ends)
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const titleMatch = (b.title || '').toLowerCase().includes(q);
        const authorMatch = (b.author || '').toLowerCase().includes(q);
        if (!titleMatch && !authorMatch) {
          return false;
        }
      }

      return true;
    });
  }, [books, selectedGenreFilter, selectedStatusFilter, favoritesOnly, searchQuery]);

  // Summary breakdown
  const statusBreakdown = useMemo(() => {
    const counts = {};
    filteredBooks.forEach((book) => {
      if (book.status) {
        counts[book.status] = (counts[book.status] || 0) + 1;
      }
    });

    return Object.keys(counts)
      .map((st) => ({
        status: st,
        count: counts[st],
      }))
      .sort((a, b) => {
        // Status with most books first
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        // Equal counts: To Read, then Reading, then Finished
        const pA = STATUS_PRIORITY[a.status] || 99;
        const pB = STATUS_PRIORITY[b.status] || 99;
        return pA - pB;
      });
  }, [filteredBooks]);

  const favoriteCount = useMemo(() => {
    return filteredBooks.filter((b) => b.favorite).length;
  }, [filteredBooks]);

  const getStatusBadgeStyle = (st) => {
    switch (st) {
      case 'To Read':
        return { bg: colors.badgeToReadBg, text: colors.badgeToReadText };
      case 'Reading':
        return { bg: colors.badgeReadingBg, text: colors.badgeReadingText };
      case 'Finished':
        return { bg: colors.badgeFinishedBg, text: colors.badgeFinishedText };
      default:
        return { bg: colors.surfaceVariant, text: colors.text };
    }
  };

  return (
    <SafeAreaView testID="list-screen" style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerUserBox}>
          <Text style={styles.headerAppTitle}>BookShelf</Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {user?.email}
          </Text>
        </View>
        <CustomButton
          title="Logout"
          variant="outline"
          style={styles.logoutBtn}
          textStyle={styles.logoutBtnText}
          onPress={logout}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Toggle Add Book Form Button */}
        <TouchableOpacity
          style={styles.addBookToggle}
          onPress={() => {
            setShowAddForm(!showAddForm);
            setBookSuccess('');
            setErrorBook('');
          }}
          activeOpacity={0.8}
        >
          <View style={styles.addBookToggleLeft}>
            <Ionicons
              name={showAddForm ? 'remove-circle' : 'add-circle'}
              size={22}
              color={colors.primary}
            />
            <Text style={styles.addBookToggleText}>
              {showAddForm ? 'Hide Add Book Form' : 'Add New Book'}
            </Text>
          </View>
          <Ionicons
            name={showAddForm ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.primary}
          />
        </TouchableOpacity>

        {/* Section A: Add a Book Form */}
        {showAddForm && (
          <View testID="book-form" style={styles.formContainer}>
            <Text style={styles.formHeading}>Add a Book</Text>

            {/* Success message */}
            {bookSuccess ? (
              <View testID="book-success" style={styles.successBanner}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={styles.successBannerText}>{bookSuccess}</Text>
              </View>
            ) : null}

            {/* Error message */}
            {errorBook ? (
              <View testID="error-book" style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color={colors.error} />
                <Text style={styles.errorBannerText}>{errorBook}</Text>
              </View>
            ) : null}

            <CustomInput
              label="Title"
              placeholder="e.g. Dune"
              value={title}
              onChangeText={handleTitleChange}
              error={formErrors.title}
              testID="input-title"
            />

            <CustomInput
              label="Author"
              placeholder="e.g. Frank Herbert"
              value={author}
              onChangeText={handleAuthorChange}
              error={formErrors.author}
              testID="input-author"
            />

            <SelectPicker
              label="Genre"
              value={genre}
              onValueChange={handleGenreChange}
              options={GENRE_OPTIONS}
              placeholder="Choose genre"
              error={formErrors.genre}
              testID="picker-genre"
            />

            <SelectPicker
              label="Status"
              value={status}
              onValueChange={handleStatusChange}
              options={STATUS_OPTIONS}
              placeholder="Choose status"
              error={formErrors.status}
              testID="picker-status"
            />

            <CustomInput
              label="Rating (Optional, 0 to 5)"
              placeholder="e.g. 5"
              value={rating}
              onChangeText={handleRatingChange}
              keyboardType="number-pad"
              error={formErrors.rating}
              testID="input-rating"
            />

            <CustomInput
              label="Notes (Optional, max 300 characters)"
              placeholder="Add your thoughts or favorite quotes..."
              value={notes}
              onChangeText={handleNotesChange}
              multiline
              numberOfLines={3}
              error={formErrors.notes}
              testID="input-notes"
            />

            <CustomButton
              title="Add Book"
              onPress={handleAddBook}
              loading={addingBook}
              style={styles.addSubmitBtn}
              testID="button-add-book"
            />
          </View>
        )}

        {/* Section C: Filters, Search & Summary */}
        <View style={styles.filterSection}>
          {/* Search Box */}
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by title or author..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Genre Filter Chips */}
          <Text style={styles.filterLabel}>Genre:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChipScroll}>
            {GENRE_FILTER_OPTIONS.map((g) => (
              <TouchableOpacity
                key={`genre-${g}`}
                style={[
                  styles.filterChip,
                  selectedGenreFilter === g && styles.filterChipActive,
                ]}
                onPress={() => setSelectedGenreFilter(g)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedGenreFilter === g && styles.filterChipTextActive,
                  ]}
                >
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Status Filter Chips */}
          <Text style={styles.filterLabel}>Status:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChipScroll}>
            {STATUS_FILTER_OPTIONS.map((s) => (
              <TouchableOpacity
                key={`status-${s}`}
                style={[
                  styles.filterChip,
                  selectedStatusFilter === s && styles.filterChipActive,
                ]}
                onPress={() => setSelectedStatusFilter(s)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedStatusFilter === s && styles.filterChipTextActive,
                  ]}
                >
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Favorites Only Switch & Clear Button */}
          <View style={styles.filterBottomRow}>
            <View style={styles.switchRow}>
              <Ionicons
                name={favoritesOnly ? 'star' : 'star-outline'}
                size={18}
                color={favoritesOnly ? colors.starActive : colors.textMuted}
              />
              <Text style={styles.switchLabel}>Favorites only</Text>
              <Switch
                value={favoritesOnly}
                onValueChange={setFavoritesOnly}
                trackColor={{ false: colors.border, true: colors.primarySoft }}
                thumbColor={favoritesOnly ? colors.primary : '#FFFFFF'}
              />
            </View>

            <TouchableOpacity style={styles.clearBtn} onPress={handleClearFilters} activeOpacity={0.7}>
              <Ionicons name="refresh-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>
          </View>

          {/* Summary Box */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryStatRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Books Shown</Text>
                <Text testID="book-count" style={styles.statValue}>
                  {filteredBooks.length}
                </Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Favorites</Text>
                <Text testID="favorite-count" style={styles.statValue}>
                  {favoriteCount}
                </Text>
              </View>
            </View>

            {/* Status Breakdown Rows */}
            {statusBreakdown.length > 0 && (
              <View style={styles.breakdownBox}>
                <Text style={styles.breakdownHeader}>Status Breakdown:</Text>
                {statusBreakdown.map((row) => (
                  <View key={`breakdown-${row.status}`} style={styles.breakdownRow}>
                    <Text style={styles.breakdownStatusName}>{row.status}</Text>
                    <View style={styles.breakdownCountBadge}>
                      <Text style={styles.breakdownCountText}>{row.count}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Section B: The List */}
        <View style={styles.listSection}>
          <Text style={styles.listSectionTitle}>Your Books</Text>

          {booksLoading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 30 }} />
          ) : filteredBooks.length === 0 ? (
            <View testID="books-empty" style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <Ionicons name="book-outline" size={48} color={colors.textMuted} />
              </View>
              <Text style={styles.emptyText}>No books found</Text>
              <Text style={styles.emptySubText}>
                Try adjusting your search, filters, or add a new book above.
              </Text>
            </View>
          ) : (
            filteredBooks.map((book) => {
              const badge = getStatusBadgeStyle(book.status);
              return (
                <View
                  key={book.id}
                  testID="book-item"
                  style={styles.bookCard}
                >
                  <TouchableOpacity
                    style={styles.bookCardContent}
                    onPress={() => navigation.navigate('Detail', { bookId: book.id })}
                    activeOpacity={0.7}
                  >
                    <View style={styles.bookHeaderRow}>
                      <Text style={styles.bookTitle} numberOfLines={2}>
                        {book.title}
                      </Text>
                      <TouchableOpacity
                        onPress={() => toggleFavorite(book.id, book.favorite)}
                        style={styles.starBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons
                          name={book.favorite ? 'star' : 'star-outline'}
                          size={24}
                          color={book.favorite ? colors.starActive : colors.starInactive}
                        />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.bookAuthor} numberOfLines={1}>
                      by {book.author}
                    </Text>

                    <View style={styles.badgesRow}>
                      <View style={styles.genreBadge}>
                        <Text style={styles.genreBadgeText}>{book.genre}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                          {book.status}
                        </Text>
                      </View>
                      {book.rating !== null && book.rating !== undefined && (
                        <View style={styles.ratingBadge}>
                          <Ionicons name="star" size={13} color={colors.starActive} />
                          <Text style={styles.ratingText}>{book.rating}/5</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerUserBox: {
    flex: 1,
    marginRight: 12,
  },
  headerAppTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  userEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderColor: colors.border,
  },
  logoutBtnText: {
    fontSize: 13,
    color: colors.text,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  addBookToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  addBookToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addBookToggleText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  formContainer: {
    backgroundColor: colors.surface,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
    shadowColor: '#2D231E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  formHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successBg,
    borderColor: colors.successBorder,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
    gap: 6,
  },
  successBannerText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '700',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorBg,
    borderColor: colors.errorBorder,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
    gap: 6,
  },
  errorBannerText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  addSubmitBtn: {
    marginTop: 6,
  },
  filterSection: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 2,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
    marginTop: 4,
  },
  filterChipScroll: {
    marginBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  filterBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.surfaceVariant,
    gap: 4,
  },
  clearBtnText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  summaryContainer: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  summaryStatRow: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  breakdownBox: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
  breakdownHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  breakdownStatusName: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  breakdownCountBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  breakdownCountText: {
    fontSize: 12,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  listSection: {
    marginTop: 8,
  },
  listSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  emptyContainer: {
    backgroundColor: colors.surface,
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginVertical: 10,
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  emptySubText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 240,
  },
  bookCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    shadowColor: '#2D231E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  bookCardContent: {
    padding: 16,
  },
  bookHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: 10,
  },
  starBtn: {
    padding: 2,
  },
  bookAuthor: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  genreBadge: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  genreBadgeText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
});
