<?php

namespace Core;

class AvatarGenerator
{
    // Class properties to hold background color, text color, and avatar size
    private string $background;
    private string $color;
    private int $size;
    private string $avatarDir = 'uploads/profile_images/';

    /**
     * Constructor to initialize avatar properties.
     * If no background is given, a random one will be generated.
     */
    public function __construct(string $background = '', string $color = 'fff', int $size = 128)
    {
        $this->background = $background ?: $this->generateRandomColor();
        $this->color = $color;
        $this->size = $size;
    }

    /**
     * Generates the avatar URL based on the provided name and instance properties.
     *
     * @param string $name - The name to display in the avatar.
     * @return string - The generated avatar URL.
     */
    public function generate(string $name): string
    {
        $encodedName = urlencode($name);
        return "https://ui-avatars.com/api/?name={$encodedName}&background={$this->background}&color={$this->color}&size={$this->size}";
    }

    /**
     * Generates a random hex color code.
     *
     * @return string - A randomly generated color in hexadecimal format.
     */
    private function generateRandomColor(): string
    {
        return sprintf('%02x%02x%02x', rand(0, 255), rand(0, 255), rand(0, 255));
    }

    /**
     * Parses an existing avatar URL and extracts its query parameters.
     *
     * @param string $url - The full avatar URL.
     * @return array - An associative array with 'name', 'background', and 'size'.
     */
    public function parseAvatarUrl(string $url): array
    {
        $parsedUrl = parse_url($url);                     // Parse the URL into components
        parse_str($parsedUrl['query'] ?? '', $queryParams);     // Parse query string into array

        return [
            'name' => urldecode($queryParams['name'] ?? ''),
            'background' => $queryParams['background'] ?? '',
            'size' => isset($queryParams['size']) ? (int) $queryParams['size'] : 0
        ];
    }

    /**
     * Updates the avatar name while preserving the background color and size from an old URL.
     *
     * @param string $oldUrl - The existing avatar URL to extract background/size from.
     * @param string $newName - The new name to generate the updated avatar.
     * @return string - The new avatar URL with updated name and preserved settings.
     */
    public function updateNameKeepBackground(string $oldUrl, string $newName): string
    {
        $oldDetails = $this->parseAvatarUrl($oldUrl);  // Extract existing background and size

        // Preserve old background and size; fallback to random or default if missing
        $this->background = $oldDetails['background'] ?? $this->generateRandomColor();
        $this->size = $oldDetails['size'] ?? $this->size;

        return $this->generate($newName);  // Return new avatar URL with updated name
    }

    /**
     * Downloads and saves a UI avatar to the local filesystem.
     * 
     * @param string $name - The user's name for generating the avatar.
     * @param int $userId - The user ID to create a unique filename.
     * @return string - The URL path to the saved avatar.
     */
    public function downloadAndSaveAvatar(string $name, int $userId): string
    {
        // Generate the UI Avatar URL
        $avatarUrl = $this->generate($name);
        
        // Generate a unique filename based on user ID and timestamp
        $filename = 'avatar_' . $userId . '_' . time() . '.png';
        
        // Set uploads directory using DOCUMENT_ROOT like UserController
        $uploadsDir = $_SERVER['DOCUMENT_ROOT'] . '/' . $this->avatarDir;
        
        // Create directory if it doesn't exist
        if (!file_exists($uploadsDir)) {
            mkdir($uploadsDir, 0755, true);
        }
        
        $filePath = $uploadsDir . '/' . $filename;
        
        // Download the image from UI Avatars
        $imageContent = file_get_contents($avatarUrl);
        if ($imageContent === false) {
            return '/assets/images/user-profile/default-profile.png';
        }
        
        // Save the image to the filesystem
        if (file_put_contents($filePath, $imageContent) === false) {
            return '/assets/images/user-profile/default-profile.png';
        }
        
        // Return the web-accessible path to the image
        return '/' . $this->avatarDir . $filename;
    }

    /**
     * Sets the directory where avatars should be stored.
     * 
     * @param string $dir - The directory path.
     * @return void
     */
    public function setAvatarDirectory(string $dir): void
    {
        // Remove leading and trailing slashes for consistency
        $dir = trim($dir, '/');
        $this->avatarDir = $dir;
    }
}
