<?php
/**
 * The main template file
 *
 * @package CBTV_Theme
 */
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" type="image/x-icon" href="<?php echo get_template_directory_uri(); ?>/favicon.ico" />
    <link rel="icon" type="image/jpeg" href="<?php echo get_template_directory_uri(); ?>/favicon.jpg" />
    <link rel="apple-touch-icon" href="<?php echo get_template_directory_uri(); ?>/favicon.jpg" />
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
    <?php wp_body_open(); ?>
    <div id="root"></div>
    <?php wp_footer(); ?>
</body>
</html>
