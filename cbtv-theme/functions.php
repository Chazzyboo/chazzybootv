<?php
/**
 * Theme functions and definitions
 *
 * @package CBTV_Theme
 */

if (!function_exists('cbtv_theme_setup')):
    function cbtv_theme_setup()
    {
        add_theme_support('title-tag');
        add_theme_support('post-thumbnails');
    }
endif;
add_action('after_setup_theme', 'cbtv_theme_setup');

/**
 * Enqueue scripts and styles from Vite Manifest.
 */
function cbtv_theme_enqueue_assets()
{
    $manifest_path = get_template_directory() . '/.vite/manifest.json';

    if (file_exists($manifest_path)) {
        $manifest_content = file_get_contents($manifest_path);
        $manifest = json_decode($manifest_content, true);

        if (isset($manifest['index.html'])) {
            $entry = $manifest['index.html'];

            // Enqueue CSS
            if (isset($entry['css'])) {
                foreach ($entry['css'] as $index => $css_file) {
                    wp_enqueue_style('cbtv-theme-style-' . $index, get_template_directory_uri() . '/' . $css_file, array(), '1.0.0');
                }
            }

            // Enqueue JS
            if (isset($entry['file'])) {
                wp_enqueue_script('cbtv-theme-script', get_template_directory_uri() . '/' . $entry['file'], array(), '1.0.0', true);
            }
        }
    }
}
add_action('wp_enqueue_scripts', 'cbtv_theme_enqueue_assets');

/**
 * Update script tags for Vite (add type="module").
 */
function cbtv_theme_script_type_module($tag, $handle, $src)
{
    if ('cbtv-theme-script' === $handle) {
        return '<script type="module" src="' . esc_url($src) . '"></script>';
    }
    return $tag;
}
add_filter('script_loader_tag', 'cbtv_theme_script_type_module', 10, 3);
