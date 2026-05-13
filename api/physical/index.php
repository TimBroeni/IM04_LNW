<?php

/**
 * @var array $return_data
 */

header('Content-Type: application/json');

require_once '../../system/config.php';

if (!isset($_GET['route']) || empty($_GET['route'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Endpoint does not exist"]);
    exit;
}

$url_parts = explode('/', $_GET['route']);
$device_serial = array_shift($url_parts);

/**
 * Get box record based on serial number
 */
$stmt = $pdo->prepare("SELECT * FROM boxes WHERE serialnumber = :serialnumber");
$stmt->execute([':serialnumber' => $device_serial]);
$box = $stmt->fetch(PDO::FETCH_OBJ);

if (!isset($box->id)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Box does not exist"]);
    exit;
}

/**
 * API Routes
 */
switch ($url_parts[0]) {
    case 'add':

        /**
         * API Route Methods
         */
        switch ($_SERVER['REQUEST_METHOD']) {
            case 'POST':

                /**
                 * POST /api/physical/[serialnumber]/add
                 */
                require_once 'lib/post/add.php';

                break;


            case 'GET':

                /**
                 * GET /api/physical/[serialnumber]/add
                 */
                require_once 'lib/get/add.php';

                break;

            /**
             * API Route Methods default
             */
            default:
                http_response_code(405);
                echo json_encode(["status" => "error", "message" => "Method not allowed"]);
                exit;
        }

        echo json_encode(["status" => "success", "data" => $return_data]);

        break;

    case 'status':

        /**
         * API Route Methods
         */
        switch ($_SERVER['REQUEST_METHOD']) {
            case 'GET':

                /**
                 * GET /api/physical/[serialnumber]/status
                 */
                require_once 'lib/get/status.php';

                break;

            /**
             * API Route Methods default
             */
            default:
                http_response_code(405);
                echo json_encode(["status" => "error", "message" => "Method not allowed"]);
                exit;
        }

        echo json_encode(["status" => "success", "data" => $return_data]);

        break;

    case 'event':

        /**
         * API Route Methods
         */
        switch ($_SERVER['REQUEST_METHOD']) {
            case 'POST':

                /**
                 * POST /api/physical/[serialnumber]/event
                 */
                require_once 'lib/post/event.php';

                break;

            /**
             * API Route Methods default
             */
            default:
                http_response_code(405);
                echo json_encode(["status" => "error", "message" => "Method not allowed"]);
                exit;
        }

        echo json_encode(["status" => "success", "data" => $return_data]);

        break;

    /**
     * API Routes default
     */
    default:
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Endpoint does not exist"]);
        break;
}
