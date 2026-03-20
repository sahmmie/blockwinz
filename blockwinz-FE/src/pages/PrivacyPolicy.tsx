import { Box, Heading, Text, VStack } from '@chakra-ui/react';

const PrivacyPolicy = () => {
  return (
    <Box
      mx='auto'
      p={{ base: 4, md: 8 }}
      bg='#151832'
      borderRadius='8px'
      color='white'
      fontSize='md'
      boxShadow='0 4px 24px rgba(0,0,0,0.10)'>
      <Heading as='h1' size='xl' mb={6} color='#00DD25'>
        Privacy Policy
      </Heading>
      <VStack align='start' gap={6}>
        <Box>
          <Heading as='h2' size='md' mb={2} color='#00DD25'>
            1. Introduction
          </Heading>
          <Text>
            Blockwinz ("we," "us," or "our") is committed to protecting your
            privacy. This Privacy Policy explains how we collect, use, and
            protect your information when you access and use the Blockwinz
            platform and services.
          </Text>
        </Box>

        <Box>
          <Heading as='h2' size='md' mb={2} color='#00DD25'>
            2. Information We Collect
          </Heading>
          <Text>
            Blockwinz is a non-custodial, wallet-based platform. We do not
            collect personally identifiable information unless you choose to
            contact us directly. We may collect: - Wallet addresses used for
            authentication and transactions - Gameplay data, session activity,
            and usage analytics - Device information and IP address (for
            security and analytics) - Email address (if provided during support
            or promotions)
          </Text>
        </Box>

        <Box>
          <Heading as='h2' size='md' mb={2} color='#00DD25'>
            3. How We Use Your Information
          </Heading>
          <Text>
            The information we collect is used to: - Provide and improve our
            services - Prevent fraud, abuse, or security breaches - Communicate
            with you when necessary (support, updates, promotions) - Analyze
            user behavior and trends to enhance gameplay experience
          </Text>
        </Box>

        <Box>
          <Heading as='h2' size='md' mb={2} color='#00DD25'>
            4. Cookies and Analytics
          </Heading>
          <Text>
            We may use cookies and third-party analytics tools to understand
            user behavior, traffic sources, and performance. These tools do not
            identify you personally but help improve the platform.
          </Text>
        </Box>

        <Box>
          <Heading as='h2' size='md' mb={2} color='#00DD25'>
            5. Sharing Your Data
          </Heading>
          <Text>
            We do not sell or rent your personal information. We may share
            minimal data: - With service providers who assist in analytics or
            infrastructure - To comply with legal obligations or enforce our
            terms - In case of a business transfer or merger
          </Text>
        </Box>

        <Box>
          <Heading as='h2' size='md' mb={2} color='#00DD25'>
            6. Data Security
          </Heading>
          <Text>
            We implement appropriate security measures to protect your
            information. However, since transactions and identities on
            blockchain systems are inherently public and decentralized, complete
            security cannot be guaranteed.
          </Text>
        </Box>

        <Box>
          <Heading as='h2' size='md' mb={2} color='#00DD25'>
            7. Your Rights
          </Heading>
          <Text>
            As we do not require user registration or store personally
            identifiable information by default, most data rights (like deletion
            or correction) do not apply. If you have shared information
            voluntarily, you may contact us to request access, correction, or
            deletion.
          </Text>
        </Box>

        <Box>
          <Heading as='h2' size='md' mb={2} color='#00DD25'>
            8. Children's Privacy
          </Heading>
          <Text>
            Blockwinz is not intended for children under 18. We do not knowingly
            collect or solicit personal information from anyone under the age of
            18.
          </Text>
        </Box>

        <Box>
          <Heading as='h2' size='md' mb={2} color='#00DD25'>
            9. Changes to This Policy
          </Heading>
          <Text>
            We may update this Privacy Policy from time to time. We encourage
            users to review this page periodically for any changes. Your
            continued use of Blockwinz constitutes acceptance of the updated
            policy.
          </Text>
        </Box>

        <Box>
          <Heading as='h2' size='md' mb={2} color='#00DD25'>
            10. Contact Us
          </Heading>
          <Text>
            If you have questions about this Privacy Policy, please contact us
            at support@blockwinz.com.
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default PrivacyPolicy;
