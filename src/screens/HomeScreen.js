import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { CustomButton } from '../components/CustomButton';

export const HomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBadge}>
            <Ionicons name="book" size={20} color={colors.primary} />
          </View>
          <Text style={styles.headerTitle}>BookShelf</Text>
        </View>

        <View style={styles.headerActions}>
          <CustomButton
            title="Login"
            variant="outline"
            style={styles.headerBtn}
            textStyle={styles.headerBtnText}
            onPress={() => navigation.navigate('Login')}
          />
          <CustomButton
            title="Register"
            variant="primary"
            style={[styles.headerBtn, styles.registerBtn]}
            textStyle={styles.headerBtnText}
            onPress={() => navigation.navigate('Register')}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconCircle}>
            <Ionicons name="library" size={44} color={colors.primary} />
          </View>
          <Text testID="home-title" style={styles.title}>
            BookShelf
          </Text>
          <Text style={styles.subtitle}>
            Your personal digital sanctuary to organize, track, and cherish every book in your collection. Keep your private list safe and accessible anytime.
          </Text>
        </View>

        {/* Feature Cards Section */}
        <Text style={styles.sectionHeader}>Key Features</Text>

        <View style={styles.cardsContainer}>
          {/* Card 1 */}
          <View style={styles.featureCard}>
            <View style={[styles.cardIconBox, { backgroundColor: '#FDF0ED' }]}>
              <Ionicons name="bookmarks" size={24} color={colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Track your books</Text>
              <Text style={styles.cardDesc}>
                Maintain your private list of books you own or plan to read with detailed notes and ratings.
              </Text>
            </View>
          </View>

          {/* Card 2 */}
          <View style={styles.featureCard}>
            <View style={[styles.cardIconBox, { backgroundColor: '#F6DDD0' }]}>
              <Ionicons name="funnel" size={24} color={colors.secondary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Sort by status</Text>
              <Text style={styles.cardDesc}>
                Seamlessly categorize your library into To Read, Reading, and Finished with instant breakdowns.
              </Text>
            </View>
          </View>

          {/* Card 3 */}
          <View style={styles.featureCard}>
            <View style={[styles.cardIconBox, { backgroundColor: '#FFF4E5' }]}>
              <Ionicons name="star" size={24} color={colors.starActive} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Rate your favorites</Text>
              <Text style={styles.cardDesc}>
                Highlight your most beloved titles with a star toggle and filter your favorites in a tap.
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Call to Action */}
        <View style={styles.ctaBox}>
          <Text style={styles.ctaTitle}>Ready to organize your reading?</Text>
          <Text style={styles.ctaDesc}>Create an account now or sign in to access your private library.</Text>
          <View style={styles.ctaButtons}>
            <CustomButton
              title="Get Started (Register)"
              variant="primary"
              style={styles.ctaBtn}
              onPress={() => navigation.navigate('Register')}
            />
            <CustomButton
              title="Sign In (Login)"
              variant="secondary"
              style={styles.ctaBtn}
              onPress={() => navigation.navigate('Login')}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? 8 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: 0.3,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  registerBtn: {
    paddingHorizontal: 14,
  },
  headerBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: 24,
    paddingHorizontal: 10,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primarySoft,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 340,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
    marginTop: 8,
  },
  cardsContainer: {
    gap: 12,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    shadowColor: '#2D231E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  ctaBox: {
    marginTop: 28,
    backgroundColor: colors.surfaceVariant,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  ctaDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaButtons: {
    width: '100%',
    gap: 10,
  },
  ctaBtn: {
    width: '100%',
  },
});
